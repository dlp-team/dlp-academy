## [2026-02-26] Feature Update: Folder Share Role Upsert
### Context & Architecture
`useFolders.shareFolder` is the folder-side share primitive used by Home modal flows and propagates sharing to folder-level data while preserving shortcut guarantees.

### Previous State
- Existing shares could not be role-updated through the same API path.
- UI-driven permission changes required additional custom logic not available in this hook.

### New State & Logic
- Kept method signature role-aware and normalized role at write-time.
- Added already-shared role mutation path that updates `sharedWith` role in place.
- Preserved idempotent shortcut upsert behavior and rollback semantics for failed shortcut steps.
- Return payload now includes `alreadyShared` and `roleUpdated` flags for UI messaging.

---

# useFolders.js

## Purpose
- **Source file:** `src/hooks/useFolders.js`
- **Last documented:** 2026-02-24
- **Role:** Custom React hook that manages all folder hierarchies, sharing inheritance, subject containment, and real-time sync with Firestore.

## High-Level Architecture

This hook implements a **dual-listener pattern** with **atomic batch operations** and **hierarchical sharing inheritance**:

1. **Dual Real-time Listeners:**
   - Owned folders: `ownerId === user.uid`
   - Shared folders: `isShared === true` AND current user in `sharedWith` array

2. **Sharing Inheritance:** When a folder is created under a parent, it automatically inherits the parent's `sharedWith` and `sharedWithUids` arrays

3. **Atomic Subject Linking:** When adding a subject to a folder, both documents are updated transactionally via `writeBatch()` to ensure consistency

4. **Institution Filtering:** All folders are filtered by `institutionId` to prevent cross-institution data leaks

## Key Functions

### `useFolders(user)` - Main Hook
- Establishes dual Firestore listeners (owned + shared folders)
- Returns state + operations: `{ folders, loading, addFolder, moveFolder, addSubjectToFolder, deleteFolder, shareFolder, unshareFolder, updateFolder }`

### `addFolder(payload)` - Create with Inheritance
- If `parentId` provided: Fetches parent, inherits `sharedWith` and `sharedWithUids` arrays
- Auto-assigns `ownerId`, `ownerEmail`, `institutionId`

### `addSubjectToFolder(folderId, subjectId)` - Atomic Batch Operation
- Uses `writeBatch()` for atomic consistency
- Fetches folder's sharing, merges into subject's arrays, updates both atomically
- Result: Subject inherits all folder's sharing permissions

### `moveFolder(folderId, newParentId)` - Re-parent with Validation
- Validates move via `isInvalidFolderMove()` utility (prevents circular hierarchies)
- Re-inherits sharing from new parent
- Updates `parentId` and `sharedWith` arrays

### `deleteFolder(id)` & `deleteRecursive(id)` - Removal
- Simple delete or recursive deletion of all children

### `shareFolder(folderId, email)` & `unshareFolder(folderId, email)` - Sharing Management
- Add/remove users from `sharedWith` array
- Updates `isShared` flag and `sharedWithUids` array
- Exposes behavior through the module exports consumed by pages and sibling shared modules.

## Functions Explained
### useFolders
- **Type:** const arrow
- **Parameters:** `user`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### updateState
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Referenced internally 1 time(s), indicating reuse/composition.

### addSubjectToFolder
- **Type:** const arrow
- **Parameters:** `folderId`, `subjectId`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### addFolder
- **Type:** const arrow
- **Parameters:** `payload`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### updateFolder
- **Type:** const arrow
- **Parameters:** `id`, `payload`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### deleteFolder
- **Type:** const arrow
- **Parameters:** `id`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### deleteFolderRecursive
- **Type:** const arrow
- **Parameters:** `folderId`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Referenced internally 1 time(s), indicating reuse/composition.

### deleteFolderOnly
- **Type:** const arrow
- **Parameters:** `id`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### shareFolder
- **Type:** const arrow
- **Parameters:** `folderId`, `email`, `role = 'viewer'`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### unshareFolder
- **Type:** const arrow
- **Parameters:** `folderId`, `email`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### moveSubjectBetweenFolders
- **Type:** const arrow
- **Parameters:** `subjectId`, `fromFolderId`, `toFolderId`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### moveSubjectToParent
- **Type:** const arrow
- **Parameters:** `subjectId`, `currentFolderId`, `parentId`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### moveFolderToParent
- **Type:** const arrow
- **Parameters:** `folderId`, `currentParentId`, `newParentId`, `options = {}`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### moveFolderBetweenParents
- **Type:** const arrow
- **Parameters:** `folderId`, `fromParentId`, `toParentId`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 2 time(s).
  - `useEffect()` from `react` is called 1 time(s).
  - `isInvalidFolderMove()` from `../utils/folderUtils` is called 2 time(s).
- **Internal function interactions:**
  - `updateState()` is reused inside this file (1 additional call(s)).
  - `deleteFolderRecursive()` is reused inside this file (1 additional call(s)).

## Imports and Dependencies
- `react`: `useState`, `useEffect`
- `../firebase/config`: `db`
- `../utils/folderUtils`: `isInvalidFolderMove`

## Example
```jsx
import { useFolders } from '../hooks/useFolders';

function ExampleComponent() {
  const state = useFolders();
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
