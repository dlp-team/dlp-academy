# ListViewItem.jsx

## Changelog
### 2026-04-12: Subject navigate callback now includes click event metadata
- Subject list-row bridge now forwards click event context into `onNavigateSubject` to support Home modifier-aware selection behavior.

### 2026-04-10: Multi-selection list-row drag ghost support
- Subject list rows now pass selection-aware `multiDragCount` to `useGhostDrag`.
- Added `data-selection-key` on draggable row containers to keep selection identity explicit during grouped drags.

### 2026-04-05: Home nested list selection-dimming parity
- Added optional selection-context inputs (`selectMode`, `selectedItemKeys`, `enableSelectionDimming`).
- Subject rows now compute selected state from shared selection keys and apply Home dimming helper classes when appropriate.
- Folder rows now receive row-level dimming contract via `FolderListItem` props while preserving recursive rendering behavior.

### 2026-04-04: Shared selection ring parity
- List rows now consume shared selection ring constants used across manual and bin surfaces for visual consistency.

### 2026-04-01: Completion state passthrough for list rows
- Added subject-row passthrough props `isCompleted` and `onToggleCompletion` to support completion toggles in list layout.

### 2026-03-09: Keyboard copy/cut visual feedback support
- Added optional `getCardVisualState(id, type)` integration.
- Applies scale pulse and cut-pending opacity classes to both folder and subject list rows.

## Purpose
- **Source file:** `src/components/modules/ListViewItem.jsx`
- **Last documented:** 2026-04-05
- **Role:** Feature module component composed by pages and higher-level views.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 4 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### ListViewItem
- **Type:** const arrow
- **Parameters:** `{ 
    user`, `item`, `type`, `parentId`, `depth = 0`, `allFolders`, `allSubjects`, `onNavigate`, `onNavigateSubject`, `onEdit`, `onDelete`, `onShare`, `cardScale = 100`, `onDragStart`, `onDragEnd`, `onDropAction`, `path = []
}`
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

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 2 time(s).
  - `useGhostDrag()` from `../../hooks/useGhostDrag` is called 1 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `React`, `useState`
- `lucide-react`: `GripVertical`
- `./ListItems/SubjectListItem`: `SubjectListItem`
- `./ListItems/FolderListItem`: `FolderListItem`
- `../../hooks/useGhostDrag`: `useGhostDrag`

## Example
```jsx
import ListViewItem from '../components/modules/ListViewItem';

function ExampleScreen() {
  return <ListViewItem />;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
