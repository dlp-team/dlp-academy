# FolderCard.jsx

## Purpose
- **Source file:** `src/components/modules/FolderCard/FolderCard.jsx`
- **Last documented:** 2026-02-24
- **Role:** Display component for a single folder as a draggable, droppable card.

## High-Level Architecture

This component implements a **complex drag-drop pattern** with nested hierarchy support:
1. **Dual Role:** Folder is both draggable (can move to different parent) AND droppable (can receive subjects/folders)
2. **Drop-Zone Indicator:** Renders visual feedback ('Soltar aquí' overlay) when user drags over
3. **Validation:** `canDrop` boolean prevents invalid moves (circular hierarchies, institution violations)
4. **Composition:** Logic in `useFolderCardLogic` hook, presentation in `FolderCardTab` + `FolderCardBody`

## Drag-Drop Handlers (from useFolderCardLogic)

### `handleDragStart(e)` - Encode Folder Metadata
```javascript
const dragData = {
  id: folder.id,
  type: 'folder',
  parentId: folder.parentId,  // Where this folder currently lives
  institutionId: folder.institutionId
};
e.dataTransfer.effectAllowed = 'move';
```
Communicates to drop target: "I'm a folder, here's my current location"

### `handleDragOver(e)` - Validate Drop Zone
1. Parses drag data
2. Checks validity via `isInvalidFolderMove(dragData.id, folder.id)`:
   - Prevents dropping into itself (circular parent)
   - Prevents dropping into own child (hierarchy break)
   - Prevents cross-institution moves
3. If valid: Sets `state.isOver = true` → renders drop indicator
4. If invalid: Sets `effectAllowed = 'none'`

### `handleDragLeave(e)` - Hide Indicator
Sets `state.isOver = false` when drag leaves the zone

### `handleDrop(e)` - Process Drop
1. Routes by `dragData.type`:
   - Folder: calls `useFolders.moveFolder(dragData.id, folder.id)`
   - Subject: calls `useFolders.addSubjectToFolder(folder.id, dragData.id)`
2. Clears `state.isOver`
3. Backend Firestore write completes, listeners trigger, component re-renders

## Drop-Zone Visual Feedback

When `state.isOver === true`:
```jsx
<div className="absolute inset-0 rounded-lg border-4 border-indigo-500 bg-indigo-50 bg-opacity-20">
  <span>Soltar aquí</span>
</div>
```
- 4px indigo border + overlay
- Indicates valid drop target

## Component Structure
```jsx
<FolderCard>
  <FolderCardTab />      // Header
  <FolderCardBody />     // Content (subjects + subfolders)
  {state.isOver && <DropZoneIndicator />}
</FolderCard>
```

## Key Behavioral Notes
1. Prevents self-drop via validation
2. Sharing inheritance: When folder moved, re-inherits from new parent
3. Subject cascade: When subject added, inherits folder's sharing (atomic batch)
4. Async feedback: Indicator updates immediately; Firestore writes silent in background
5. Error resilience: If write fails, optimistic update reverts naturally on next listener fire
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### FolderCard
- **Type:** const arrow
- **Parameters:** `props`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useFolderCardLogic()` from `./useFolderCardLogic` is called 1 time(s).
  - `useGhostDrag()` from `../../../hooks/useGhostDrag` is called 1 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `React`
- `./useFolderCardLogic`: `useFolderCardLogic`
- `./FolderCardTab`: `FolderCardTab`
- `./FolderCardBody`: `FolderCardBody`
- `../../../hooks/useGhostDrag`: `useGhostDrag`

## Example
```jsx
import FolderCard from '../components/modules/FolderCard/FolderCard';

function ExampleScreen() {
  return <FolderCard />;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
