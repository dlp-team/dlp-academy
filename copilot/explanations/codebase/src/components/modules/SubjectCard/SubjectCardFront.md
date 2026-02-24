# SubjectCardFront.jsx

## Purpose
- **Source file:** `src/components/modules/SubjectCard/SubjectCardFront.jsx`
- **Last documented:** 2026-02-24
- **Role:** Feature module component composed by pages and higher-level views.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 1 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### SubjectCardFront
- **Type:** const arrow
- **Parameters:** `{
    subject`, `user`, `onSelect`, `activeMenu`, `onToggleMenu`, `onEdit`, `onDelete`, `onShare`, `isModern`, `fillColor`, `scaleMultiplier`, `topicCount`, `onOpenTopics`, `filterOverlayOpen = false`, `onCloseFilterOverlay
}`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 1 time(s).
  - `useRef()` from `react` is called 1 time(s).
  - `useLayoutEffect()` from `react` is called 1 time(s).
  - `createPortal()` from `react-dom` is called 1 time(s).
  - `getIconColor()` from `../../ui/SubjectIcon` is called 2 time(s).
  - `shouldShowEditUI()` from `../../../utils/permissionUtils` is called 1 time(s).
  - `shouldShowDeleteUI()` from `../../../utils/permissionUtils` is called 1 time(s).
  - `canEditItem()` from `../../../utils/permissionUtils` is called 1 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `React`, `useState`, `useRef`, `useLayoutEffect`
- `react-dom`: `createPortal`
- `lucide-react`: `ChevronRight`, `MoreVertical`, `Edit2`, `Trash2`, `Share2`, `Users`
- `../../ui/SubjectIcon`: `SubjectIcon`, `getIconColor`
- `../../../utils/permissionUtils`: `shouldShowEditUI`, `shouldShowDeleteUI`, `canEditItem`

## Example
```jsx
import SubjectCardFront from '../components/modules/SubjectCard/SubjectCardFront';

function ExampleScreen() {
  return <SubjectCardFront />;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
