# ListViewItem.jsx

## Purpose
- **Source file:** `src/components/modules/ListViewItem.jsx`
- **Last documented:** 2026-02-24
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
