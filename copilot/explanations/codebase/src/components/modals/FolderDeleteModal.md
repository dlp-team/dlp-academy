# FolderDeleteModal.jsx

## Purpose
- **Source file:** `src/components/modals/FolderDeleteModal.jsx`
- **Last documented:** 2026-02-24
- **Role:** Modal component that encapsulates focused user actions and confirmations.

## File Flow (High Level)
- Receives data/capabilities from imported modules and React ecosystem APIs.
- Defines 4 function(s) that implement the module behavior.
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### FolderDeleteModal
- **Type:** const arrow
- **Parameters:** `{ isOpen`, `onClose`, `onDeleteAll`, `onDeleteFolderOnly`, `folderName`, `itemCount }`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleBackdropClick
- **Type:** const arrow
- **Parameters:** `e`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleConfirmDelete
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### handleCancel
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 1 time(s).
- Internal function-to-function calls are minimal or implicit through JSX/event handlers.

## Imports and Dependencies
- `react`: `React`, `useState`
- `lucide-react`: `AlertTriangle`, `Trash2`, `FolderOpen`, `X`, `ArrowLeft`

## Example
```jsx
import FolderDeleteModal from '../components/modals/FolderDeleteModal';

function ExampleScreen() {
  return <FolderDeleteModal />;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
