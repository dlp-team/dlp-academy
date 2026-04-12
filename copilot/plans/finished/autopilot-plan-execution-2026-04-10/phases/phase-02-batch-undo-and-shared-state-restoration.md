<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-10/phases/phase-02-batch-undo-and-shared-state-restoration.md -->
# Phase 02 - Batch Undo and Shared-State Restoration

## Status
- IN_REVIEW

## Objective
Guarantee undo correctness for all affected entities in batch actions and prevent selection-mode side effects after Ctrl+Z.

## Scope
- Undo reverts full batch action (move/delete/etc), not first/last-only behavior.
- Ctrl+Z undo does not auto-reactivate selection mode.
- Undo card action restores all affected entities consistently.
- Shared-folder boundary undo restores expected sharing state when returning to shared folders.

## Risks
- Undo stack payload shape drift across action types.
- Shared metadata restoration can regress permission/share visibility.

## Exit Criteria
- [x] Batch undo restores every affected element deterministically.
- [x] Selection mode remains off after undo when expected.
- [x] Shared-state restoration verified for shared-folder exit/return cases.
- [x] Undo card and Ctrl+Z parity confirmed.

## Implementation Update (2026-04-10)
- Extended bulk-move undo snapshots to persist pre-move sharing metadata (`sharedWith`, `sharedWithUids`, `isShared`) for subjects/folders.
- Updated undo replay to restore both parent/folder placement and prior sharing metadata, fixing shared-folder boundary restoration regressions.
- Adjusted bulk undo completion flow to keep selection mode disabled after undo (no automatic re-entry).
- Added regression coverage in `tests/unit/hooks/useHomeBulkSelection.test.js` validating selection-mode non-reactivation and sharing metadata restoration.
- Added mixed subject+folder batch undo coverage in [tests/unit/hooks/useHomeBulkSelection.test.js](../../../../../tests/unit/hooks/useHomeBulkSelection.test.js) to verify deterministic restoration of both `folderId` (subjects) and `parentId` (folders) plus sharing metadata parity.

## Implementation Update (2026-04-11)
- Added explicit Ctrl+Z parity tests in [tests/unit/hooks/useHomeBulkSelection.test.js](../../../../../tests/unit/hooks/useHomeBulkSelection.test.js):
	- verifies keyboard shortcut triggers the same undo callback used by undo toast action,
	- verifies Ctrl+Z is ignored when no undo payload exists.
- Consolidated evidence that batch undo restoration is deterministic across subject-only and mixed subject+folder selections.

## Validation Evidence (2026-04-11)
- `npm run test:unit -- tests/unit/hooks/useHomeBulkSelection.test.js` -> PASS (8/8).
