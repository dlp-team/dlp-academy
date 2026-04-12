## [2026-04-12] Batch Confirmation Preview Payloads
### Context & Behavior
- Selection-mode batch moves now require confirmation dialogs to show selected names/count while preserving single-item confirmation behavior.

### Change
- Added `getMoveConfirmationPreview(moveOptions)` helper to normalize preview payloads.
- Share/unshare confirmation payloads created from batch move paths now include `selectionPreview` metadata.
- Added `skipShortcutUndo` support so batch move calls can suppress per-item keyboard undo registrations and keep a single aggregated undo entry.
- `closeShareConfirm` and `closeUnshareConfirm` now clear `selectionPreview` alongside existing modal fields.

## [2026-04-09] Batch Confirmation Decision Reuse and Deferred Continuation Hooks
### Context & Behavior
- Phase 02 required shared/unshare confirmation decisions to apply to all remaining selected items instead of forcing repeated per-item prompts.

### Change
- Added batch-move option hooks in `moveSelectionEntryWithShareRules` and shared move handlers:
	- `batchDecisions` read path,
	- `setBatchDecision` write path,
	- `onDeferredResolved` callback,
	- `onDeferredCancelled` callback.
- Added decision-keyed auto-apply branches for subject/folder move confirmations:
	- shared mismatch (`align` / `merge`),
	- unshare transitions (`remove` / `preserve`),
	- shared-target adoption (`confirm`).
- Confirmation payloads now emit deferred-resolution/cancel notifications so selection-mode orchestration can auto-resume or finalize when the user confirms/cancels.

## [2026-04-08] Drag/Drop and Confirmation Move Paths Register Undo Payloads
### Context & Behavior
- Phase 02 required non-creation element actions to become undoable via shared keyboard/toast infrastructure.

### Change
- `useHomePageHandlers` now accepts optional `registerUndoAction` callback.
- Added normalized move undo helpers for:
	- subjects (`move-subject`),
	- folders (`move-folder`),
	- shortcuts (`move-shortcut`).
- Wired undo registration across upward drop, breadcrumb drops, nested moves, promote flows, tree moves, and shared confirmation callbacks.

## [2026-04-07] Breadcrumb Shortcut Drop Status Contract Normalization
### Context & Behavior
- `handleDropOnFolderWrapper` and selection-mode orchestration already used status tokens (`moved`, `blocked`, `deferred`, `noop`).
- `handleBreadcrumbDrop` shortcut path could return an unresolved Promise through `moveShortcutOrRequest`, creating mixed return shapes in downstream tests.

### Change
- Normalized breadcrumb shortcut drop branch to return explicit status tokens synchronously:
	- `deferred` when owner-approval overlay is opened,
	- `moved` when shortcut move is dispatched.
- Preserved existing shortcut request overlay behavior and direct shortcut move behavior.

## [2026-04-07] Selection-Mode Batch Move Rules Parity
### Context & Behavior
- Added `moveSelectionEntryWithShareRules` to expose per-entry move orchestration for selection-mode batch moves.
- Reused the same share/unshare/deferred confirmation path previously used in single-item move flows.
- Move handlers now return explicit status markers (`moved`, `deferred`, `blocked`, `noop`) to support deterministic bulk feedback and follow-up actions.

## [2026-04-02] Shortcut Move Request Callable Wiring
### Context & Behavior
- Replaced shortcut move-request placeholder logging with real callable submission flow.
- Added `createShortcutMoveRequest` service dependency in Home drag/drop handlers.
- `shortcut-move-request` confirmation payload now sends:
	- `shortcutId`,
	- `targetFolderId`,
	- `targetId`,
	- `shortcutType` (`subject` or `folder`).

### UX/Feedback Changes
- Added `onHomeFeedback` wiring at hook boundary so request outcomes are surfaced inline in Home feedback banner.
- Added explicit feedback paths:
	- success: request submitted,
	- duplicate pending request: warning,
	- unexpected callable failure: error.

## [2026-03-06] Test Hardening: DnD Matrix and Confirmation Overlay Branches
### Context & Validation Additions
- Added a dedicated matrix suite `tests/unit/hooks/useHomePageHandlers.dndMatrix.test.js` to close high-risk drag/drop branches.
- Newly covered branches include:
	- upward drop direct-vs-shortcut movement paths,
	- folder nesting permission blocks,
	- shared mismatch merge callbacks during folder moves,
	- promote-folder unshare confirmation cascade,
	- tree move subject shortcut fallback and editable direct move path.

## [2026-03-08] Test Hardening: Read-Only Shared-Context Guard Branches
### Context & Validation Additions
- Extended `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js` to assert viewer-in-shared-folder guard behavior across additional mutation entry points:
	- `handleUpwardDrop` early-exit branch,
	- `handlePromoteFolderWrapper` early-exit branch,
	- `handleTreeMoveSubject` early-exit branch.
- Confirms read-only users cannot trigger movement mutations through upward drop, promote-folder, or tree-move pathways.

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

## [2026-03-09] Test Hardening: Breadcrumb and Shared-to-Private Unshare Paths
### Context & Validation Additions
- Expanded `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js` to close additional drag/drop coverage around shared boundary transitions:
	- breadcrumb direct move in non-shared source/target path,
	- breadcrumb shared->private unshare confirmation callback,
	- nest-folder shared->private unshare confirmation callback,
	- promote-folder shared->private unshare confirmation callback,
	- direct non-shared subject drop path without share/unshare prompts.
- Confirms shared-boundary unshare logic remains deterministic while preserving non-shared move fast-path behavior.

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
