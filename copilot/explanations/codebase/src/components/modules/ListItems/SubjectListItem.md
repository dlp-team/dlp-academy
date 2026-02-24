# SubjectListItem.jsx

## Purpose
- **Source file:** `src/components/modules/ListItems/SubjectListItem.jsx`
- **Last documented:** 2026-02-24
- **Role:** Feature module component composed by pages and higher-level views.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 1 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### SubjectListItem
- **Type:** const arrow
- **Parameters:** `{ 
    user`, `subject`, `onSelect`, `onEdit`, `onDelete`, `onShare`, `compact = false`, `cardScale = 100`, `className = ""
}`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 2 time(s).
  - `createPortal()` from `react-dom` is called 1 time(s).
  - `getIconColor()` from `../../ui/SubjectIcon` is called 1 time(s).
  - `shouldShowEditUI()` from `../../../utils/permissionUtils` is called 1 time(s).
  - `shouldShowDeleteUI()` from `../../../utils/permissionUtils` is called 1 time(s).
  - `canEditItem()` from `../../../utils/permissionUtils` is called 1 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `React`, `useState`
- `react-dom`: `createPortal`
- `lucide-react`: `ChevronRight`, `Edit2`, `Trash2`, `MoreVertical`, `Users`, `Share2`
- `../../ui/SubjectIcon`: `SubjectIcon`, `getIconColor`
- `../../../utils/permissionUtils`: `shouldShowEditUI`, `shouldShowDeleteUI`, `canEditItem`

## Example
```jsx
import SubjectListItem from '../components/modules/ListItems/SubjectListItem';

function ExampleScreen() {
  return <SubjectListItem />;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
