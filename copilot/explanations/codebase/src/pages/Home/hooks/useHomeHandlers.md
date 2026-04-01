<!-- copilot/explanations/codebase/src/pages/Home/hooks/useHomeHandlers.md -->
## [2026-04-01] Subject Save Flow: Policy-Specific Teacher Creation Denial Messaging
### Context & Architecture
- Phase 09 added teacher creation policy gating in `useSubjects.addSubject`, producing a specific user-facing denial message when disabled.

### Change
- Updated `handleSaveSubject` error handling to surface the specific policy-denial message while preserving generic fallback messaging for all other save failures.

### Validation
- Covered by focused Home/useSubjects suite and policy integration tests.

## [2026-03-30] Replaced Alert-Based DnD Errors with In-Page Feedback
### Context & Architecture
- Home drag-and-drop failure handlers were still using browser alerts, which interrupted workflow and violated in-page feedback UX requirements.

### Change
- Added optional `onHomeFeedback(message, tone)` callback input in `useHomeHandlers`.
- Replaced alert fallback in:
	- `handleDropOnFolder`
	- `handleNestFolder`
- Failures now publish non-blocking error feedback using Home page inline messaging.

### Validation
- Focused suite passed: `npm run test -- tests/unit/hooks/useHomeHandlers.shortcuts.test.js tests/unit/hooks/useHomeLogic.test.js tests/unit/pages/home/HomeControls.sharedScopeToggle.test.jsx`.

## [2026-03-30] Save/Delete Failure Feedback Hardening
### Context & Architecture
- Several Home handler branches still failed silently (console-only) or without consistent in-page error feedback for save/delete operations.

### Change
- Added callback-driven feedback for additional failure paths in `useHomeHandlers`:
	- `handleSaveSubject` (standard and student shortcut-tag mode),
	- `handleSaveFolder`,
	- `handleDelete` unshare errors and generic delete exceptions,
	- `handleDeleteFolderAll`,
	- `handleDeleteFolderOnly`.
- Preserved all existing owner/permission gates and close-modal behavior on successful operations.

### Validation
- Focused suite passed: `npm run test -- tests/unit/hooks/useHomeHandlers.shortcuts.test.js tests/unit/hooks/useHomeLogic.test.js`.

## [2026-02-26] Feature Update: Preserve Sharing on Subject Edit
### Context & Architecture
`useHomeHandlers.handleSaveSubject` is the Home modal save entrypoint for subject edits/creates and controls what fields are written to Firestore through `updateSubject` / `addSubject`.

### Previous State
- Edit payload included `isShared: false` and `sharedWith: []`, which unintentionally removed sharing after editor updates.

### New State & Logic
- Split payload intent between edit and create flows.
- Edit path now updates only mutable presentation/content fields.
- Create path still initializes sharing flags and inherits parent-folder sharing when needed.
- Outcome: editors can edit originals in shared folders without losing access.

## [2026-03-08] Test Hardening: Shortcut Deletion in Ghost Context
### Context & Validation Additions
- Expanded `tests/unit/hooks/useHomeHandlers.shortcuts.test.js` with explicit shared-tree shortcut deletion cases.
- Verified `handleDelete` preserves intended split behavior in shared contexts:
	- `action: unshare` remains blocked when shortcut parent is inside a shared tree.
	- `action: delete` still deletes `shortcut-subject` and `shortcut-folder` entries in that same context.
- Confirms ghost-context shortcut cleanup is allowed without relaxing unshare protections.

## [2026-03-09] Test Hardening: Deletion Manual-Order and Owner Gates
### Context & Validation Additions
- Expanded `tests/unit/hooks/useHomeHandlers.shortcuts.test.js` to cover additional delete-handler branches:
	- subject delete updates `manualOrder.subjects`,
	- owned folder delete updates `manualOrder.folders`,
	- `handleDeleteFolderAll` owner and non-owner paths,
	- `handleDeleteFolderOnly` owner and non-owner paths.
- Confirms destructive folder actions remain owner-gated while list ordering updates stay consistent after successful deletion actions.

## [2026-03-09] Guard Hardening: Subject Deletion Owner Gate in Ghost/Shared Contexts
### Context & Validation Additions
- Updated `useHomeHandlers.handleDelete` to enforce owner-only subject deletion (matching folder destructive guard behavior).
- Expanded `tests/unit/hooks/useHomeHandlers.shortcuts.test.js` with ghost/shared-focused assertions:
	- non-owner subject delete is blocked and exits cleanly,
	- owner subject delete still performs mutation + manual-order update,
	- shared-tree `shortcut-folder` unshare remains blocked without shortcut mutation,
	- non-shared `shortcut-folder` unshare path remains allowed and lossless.

---

# useHomeHandlers.js

## Overview
- **Source file:** `src/pages/Home/hooks/useHomeHandlers.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Handles user events and triggers updates/actions.
- Participates in navigation/routing behavior.

## Exports
- `const useHomeHandlers`

## Main Dependencies
- `../../../utils/permissionUtils`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
