## [2026-02-26] Feature Update: Direct Move Without Unshare Prompt from Root Shared Subject Context
### Context & Architecture
`handleDropOnFolderWrapper` orchestrates subject move decisions including confirmation flows for sharing transitions.

### Previous State
- Moving a shared subject from root/non-folder context into a non-shared folder could trigger unshare confirmation.

### New State & Logic
- Added fast-path: when source folder is null and target is non-shared, move directly.
- Keeps existing sharing metadata unchanged for this transition.
- Prevents unnecessary unshare modal interruptions.

---

## [2026-02-26] Feature Update: Editor Lock Inside Root Shared Folder
### Context & Architecture
`useHomePageHandlers` governs drag/drop, promote, breadcrumb drop, and tree move flows in Home. This is the right boundary to enforce folder-context movement rules.

### Previous State
- Editors could move elements out of a root shared folder in some movement paths.

### New State & Logic
- Added root-shared boundary helpers (`getRootSharedFolder`, tree inclusion check, and editor boundary guard).
- Applied guard across upward drop, drop-on-folder, breadcrumb moves, nest folder, promote subject/folder, and tree move subject.
- Editors can still move within the root shared tree, but cannot move content outside it.

---

## [2026-02-26] Feature Update: Move Guard for Source Shared Folder Permissions
### Context & Architecture
`useHomePageHandlers` coordinates DnD and tree move operations between Home UI components and `useFolders` move actions.

### Previous State
- Move checks validated target folder write access, but source-folder shared write restrictions could still be bypassed in some flows.

### New State & Logic
- Added `canWriteFromSourceFolder` helper mirroring target checks.
- Enforced source write permission in `handleDropOnFolderWrapper` and `handleTreeMoveSubject`.
- Result: a user who is editor of an item but not editor/owner of the source shared folder can edit/delete item data but cannot move it across folders.

---

# useHomePageHandlers.js

## Overview
- **Source file:** `src/pages/Home/hooks/useHomePageHandlers.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `const useHomePageHandlers`

## Main Dependencies
- `firebase/firestore`
- `../../../firebase/config`
- `../../../utils/folderUtils`
- `../../../utils/permissionUtils`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
