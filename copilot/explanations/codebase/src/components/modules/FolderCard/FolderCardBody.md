# FolderCardBody.jsx

## Purpose
- **Source file:** `src/components/modules/FolderCard/FolderCardBody.jsx`
- **Last documented:** 2026-02-24
- **Role:** Feature module component composed by pages and higher-level views.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 1 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### FolderCardBody
- **Type:** const arrow
- **Parameters:** `{
    folder`, `user`, `isModern`, `gradientClass`, `fillColor`, `scaleMultiplier`, `subjectCount`, `folderCount`, `totalCount`, `activeMenu`, `onToggleMenu`, `onEdit`, `onDelete`, `onShare`, `onShowContents`, `filterOverlayOpen
}`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useRef()` from `react` is called 1 time(s).
  - `useLayoutEffect()` from `react` is called 1 time(s).
  - `useState()` from `react` is called 1 time(s).
  - `createPortal()` from `react-dom` is called 1 time(s).
  - `getIconColor()` from `../../ui/SubjectIcon` is called 1 time(s).
  - `shouldShowEditUI()` from `../../../utils/permissionUtils` is called 1 time(s).
  - `shouldShowDeleteUI()` from `../../../utils/permissionUtils` is called 1 time(s).
  - `canEditItem()` from `../../../utils/permissionUtils` is called 1 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `React`, `useRef`, `useLayoutEffect`, `useState`
- `react-dom`: `createPortal`
- `lucide-react`: `Folder`, `MoreVertical`, `Edit2`, `Trash2`, `Share2`, `Users`, `ListTree`
- `../../ui/SubjectIcon`: `SubjectIcon`, `getIconColor`
- `../../../utils/permissionUtils`: `shouldShowEditUI`, `shouldShowDeleteUI`, `canEditItem`

## Example
```jsx
import FolderCardBody from '../components/modules/FolderCard/FolderCardBody';

function ExampleScreen() {
  return <FolderCardBody />;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
