# FolderListItem.jsx

## Changelog
### 2026-04-07: Centralized menu portal and positioning logic
- Replaced in-file `createPortal` shell and close-layer duplication with shared [ContextActionMenuPortal](../../shared/ContextActionMenuPortal.md).
- Replaced in-file menu position calculations with shared [menuPositionUtils](../../shared/menuPositionUtils.md).

### 2026-04-05: Recursive selection-context propagation
- Added optional row `dimmingClass` prop so parent list wrappers can dim only the current row (not the entire subtree wrapper).
- Propagates `selectMode`, `selectedItemKeys`, and `enableSelectionDimming` to recursive `ListViewItem` children.
- Enables nested list rows to stay in sync with Home selection-mode emphasis behavior.

## Purpose
- **Source file:** `src/components/modules/ListItems/FolderListItem.jsx`
- **Last documented:** 2026-04-05
- **Role:** Feature module component composed by pages and higher-level views.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 6 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### FolderListItem
- **Type:** const arrow
- **Parameters:** `{ 
    item`, `parentId`, `depth = 0`, `allFolders`, `allSubjects`, `onNavigate`, `onNavigateSubject`, `onEdit`, `onDelete`, `onShare = (`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleLocalDragStart
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

### handleClickFolder
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 5 time(s).
  - `useMemo()` from `react` is called 1 time(s).
  - `useRef()` from `react` is called 1 time(s).
  - `useGhostDrag()` from `../../../hooks/useGhostDrag` is called 1 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `React`, `useState`, `useMemo`, `useRef`, `useLayoutEffect`
- `lucide-react`: `ChevronRight`, `Folder`, `GripVertical`, `Users`, `MoreVertical`, `Edit2`, `Trash2`, `Share2`
- `../../ui/SubjectIcon`: `SubjectIcon`
- `../ListViewItem`: `ListViewItem`
- `../../../hooks/useGhostDrag`: `useGhostDrag`
- `../shared/menuPositionUtils`: `computeMenuPosition`
- `../shared/ContextActionMenuPortal`: `ContextActionMenuPortal`

## Example
```jsx
import FolderListItem from '../components/modules/ListItems/FolderListItem';

function ExampleScreen() {
  return <FolderListItem />;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
