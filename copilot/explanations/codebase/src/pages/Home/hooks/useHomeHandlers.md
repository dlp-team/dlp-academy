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
