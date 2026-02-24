# FolderTreeModal.jsx

## Purpose
- **Source file:** `src/components/modals/FolderTreeModal.jsx`
- **Last documented:** 2026-02-24
- **Role:** Modal component that encapsulates focused user actions and confirmations.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 10 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### getGradient
- **Type:** const arrow
- **Parameters:** `color`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Referenced internally 1 time(s), indicating reuse/composition.

### TreeItem
- **Type:** const arrow
- **Parameters:** `{ 
    item`, `type`, `index`, `parentId`, `allFolders`, `allSubjects`, `onNavigateFolder`, `onNavigateSubject`, `depth = 0`, `onDragStart`, `onDropItem`, `path = []
}`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDragStart
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDragOver
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDragLeave
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDrop
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleClick
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### FolderTreeModal
- **Type:** const arrow
- **Parameters:** `{ 
    isOpen`, `onClose`, `rootFolder`, `allFolders`, `allSubjects`, `onNavigateFolder`, `onNavigateSubject`, `onMoveSubjectToFolder`, `onNestFolder`, `onReorderSubject`, `onDropWithOverlay // <-- Add this prop for overlay logic
}`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleDropAction
- **Type:** const arrow
- **Parameters:** `dragged`, `target`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleRootDrop
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useRef()` from `react` is called 1 time(s).
  - `useState()` from `react` is called 3 time(s).
  - `getIconColor()` from `../ui/SubjectIcon` is called 1 time(s).
  - `isInvalidFolderMove()` from `../../utils/folderUtils` is called 2 time(s).
  - `useAutoScrollOnDrag()` from `../../hooks/useAutoScrollOnDrag` is called 1 time(s).
- **Internal function interactions:**
  - `getGradient()` is reused inside this file (1 additional call(s)).

## Imports and Dependencies
- `react`: `React`, `useRef`, `useState`
- `lucide-react`: `X`, `Folder`, `ChevronRight`, `FileText`, `CornerDownRight`, `GripVertical`, `ArrowUpCircle`, `Users`
- `../ui/SubjectIcon`: `SubjectIcon`, `getIconColor`
- `../../utils/folderUtils`: `isInvalidFolderMove`
- `../../hooks/useAutoScrollOnDrag`: `useAutoScrollOnDrag`

## Example
```jsx
import FolderTreeModal from '../components/modals/FolderTreeModal';

function ExampleScreen() {
  return <FolderTreeModal />;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
