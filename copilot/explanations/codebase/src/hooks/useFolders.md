<!-- copilot/explanations/codebase/src/hooks/useFolders.md -->
## [2026-04-02] Active-Role Home Read Gate Alignment
### Context
- Dual-role sessions can switch active context without changing the base profile role field.

### Change
- `useFolders` now derives role context via `getActiveRole(user)`.
- Student-mode shortcut/read filters and Home read readiness now track active role instead of raw `user.role`.

### Impact
- Folder read behavior follows switched role context deterministically for institution-admin/teacher dual-role users.

## [2026-04-02] Nested Folder Subtree Operations for Bin Drilldown
### Context
- Phase 03 required nested subfolder actions in bin drilldown without applying restore/delete to sibling branches.

### Change
- `getTrashedFolders` now supports options for drilldown fetches:
  - `includeNested` to return all trashed folders (not only top-level containers),
  - `rootFolderId` to constrain to one trashed root tree when needed.
- `restoreFolder` and `permanentlyDeleteFolder` now resolve scope by selected folder:
  - selecting a root trashed folder keeps full-tree behavior,
  - selecting a nested trashed folder applies only to that nested subtree.
- Restore parent reconciliation now validates whether external parents are still active before reconnecting; otherwise restored folders are safely re-rooted.

### Validation
- `npm run test -- tests/unit/hooks/useFolders.test.js tests/unit/hooks/useHomeHandlers.shortcuts.test.js tests/unit/hooks/useHomeLogic.test.js`
- `npx tsc --noEmit`
- `npm run lint`

## [2026-04-02] Folder Bin-First Lifecycle APIs and Soft-Delete Cascade
### Context
- Phase 03 required replacing recursive hard-delete for folders with a bin-first lifecycle while preserving folder-only delete behavior.

### Change
- `deleteFolder` now performs a trash cascade instead of immediate deletion:
  - marks folder subtree as `status: 'trashed'`,
  - marks contained subjects as trashed and clears sharing arrays,
  - records `trashedRootFolderId`/`trashedByFolderId` metadata,
  - removes owner shortcuts for affected folder/subject targets.
- Added chunk-safe batch helper for large subtree updates.
- Added folder-bin APIs:
  - `getTrashedFolders()` (top-level folder containers only),
  - `restoreFolder()` (subtree restore + nested subject restore),
  - `permanentlyDeleteFolder()` (subtree hard delete + topic/resource cleanup).
- Active folder subscriptions now exclude trashed folders from standard Home views.

### Validation
- `npm run test -- tests/unit/hooks/useFolders.test.js`
- `npm run test -- tests/unit/hooks/useHomeHandlers.shortcuts.test.js tests/unit/hooks/useHomeLogic.test.js`
- `npx tsc --noEmit`

## [2026-03-30] Circular Folder Move Guard Uses Non-Blocking Feedback
### Context
- `moveFolderBetweenParents` still used a browser alert for circular move attempts, which conflicted with non-blocking feedback standards in active workflows.

### Change
- Removed `alert(...)` from circular-dependency guard.
- Circular/self/no-op branches now return deterministic status metadata:
  - `{ moved: false, reason: 'self-target' }`,
  - `{ moved: false, reason: 'same-parent' }`,
  - `{ moved: false, reason: 'circular-dependency' }`.
- Successful moves now return `{ moved: true }`.

### Validation
- Focused lint and tests passed for touched files, including `tests/unit/hooks/useFolders.test.js`.

## [2026-03-08] Folder Deletion Resilience Hardening
### Context
- Folder deletion paths needed stronger tolerance for partial cleanup failures (subjects/shortcuts) and batch commit failures.

### Change
- `deleteFolder` now:
  - performs best-effort shortcut cleanup for folder and child-subject shortcuts owned by the current user,
  - tolerates shortcut query/delete failures,
  - falls back to direct root folder deletion if batch commit fails.
- `deleteFolderOnly` now:
  - tolerates pre-delete move batch commit failures,
  - performs best-effort shortcut cleanup before final folder deletion.

### Validation
- Focused suite passed: `npm run test -- tests/unit/hooks/useFolders.test.js`.

## [2026-03-09] Test Hardening: Shared-Subject Cascade and Owner-Scoped Shortcut Cleanup
### Context
- Folder deletion backlog required explicit coverage for shared-subject content and orphan-shortcut preservation behavior.

### Validation Additions
- Expanded `tests/unit/hooks/useFolders.test.js` with verification that:
  - deleting a shared folder still cascades deletion of shared subjects in that folder,
  - folder shortcut cleanup query is owner-scoped (`ownerId === current user`) and does not target recipient orphan shortcuts.

### Validation
- Consolidated suite passed: `npm run test -- tests/unit/hooks/useHomeHandlers.shortcuts.test.js tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useFolders.test.js tests/unit/hooks/useTopicLogic.test.js tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`.

## [2026-03-07] Home Data Readiness No Longer Requires Country
### Context & Architecture
Folder loading is gated by `canReadHomeData` to avoid premature reads before profile bootstrap.

### Change
- Updated readiness gate in `src/hooks/useFolders.js` from `role + country + displayName` to `role + displayName`.

### Validation
- Frontend unit tests pass with the updated gate (`npm run test`).

## [2026-02-26] Feature Update: Share Validation Errors as Exceptions (No UI Alerts)
### Context & Architecture
`useFolders.shareFolder` is consumed by modal UI that renders error messages in-card. Backend-style validations must therefore throw errors, not call browser alerts.

### Previous State
- `shareFolder` used `alert(...)` for self-share, cross-institution, and missing-user paths.

### New State & Logic
- Replaced alert paths with `throw new Error(...)` so UI can display errors in modal cards.
- Added owner-target guard (`targetUid === folder.ownerId`) and throw with explicit message.
- Keeps existing shortcut upsert/rollback semantics intact.

---

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
