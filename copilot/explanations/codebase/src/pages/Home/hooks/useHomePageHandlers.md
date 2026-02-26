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
