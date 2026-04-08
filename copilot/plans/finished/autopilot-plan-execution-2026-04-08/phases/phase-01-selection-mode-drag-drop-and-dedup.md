<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-08/phases/phase-01-selection-mode-drag-drop-and-dedup.md -->
# Phase 01 - Selection Mode Drag/Drop and De-dup

## Status
- COMPLETED

## Objective
Align selection-mode interaction model with individual drag/drop behavior and fix folder-child selection conflicts.

## Scope
- Batch drag/drop parity.
- Batch move confirmation parity (all selected items moved when confirmed).
- Folder-child de-dup logic in list mode.
- Selection-mode UI adjustments:
  - primary-related border for exit button,
  - no-op create-subject action while selection mode is active.

## Validation
- Unit checks for selection transitions.
- Grid/list/manual parity verification.
- `get_errors` on touched files.

## Implementation Update (2026-04-08)
- Continued plan execution after Phase 08 fix by implementing selection-mode create-subject guard.
- Home manual content create entries now disable while selection mode is active.
- Home empty-state create action now disables while selection mode is active.
- Existing primary-color exit-border styling in `HomeSelectionToolbar` kept intact.
- Added folder-child selection de-dup logic in `useHomeBulkSelection`:
  - selecting a child item clears selected ancestor folders,
  - selecting a folder clears selected descendants.
- Added regression coverage in `tests/unit/hooks/useHomeBulkSelection.test.js` for both de-dup directions.
- Re-enabled Home drag/drop affordances while selection mode is active (when user has move permissions).
- Routed selected-item drops through the bulk-selection move pipeline (`runBulkMoveToFolder`) so drop confirmations and share-rule handling apply to the full selected batch.
- Extended `useHomeContentDnd` with selection-aware batch-drop routing for both subject and folder drops in list and root zones.
- Extended `tests/unit/hooks/useHomeContentDnd.test.js` with select-mode batch drag/drop regression coverage.

## Validation Evidence (2026-04-08)
- `get_errors` on touched files -> PASS.
- `npm run test -- tests/unit/hooks/useHomeBulkSelection.test.js tests/unit/pages/home/HomeMainContent.test.jsx tests/unit/pages/topic/TopicTabs.createActions.test.jsx tests/unit/hooks/useTopicLogic.test.js` -> PASS.
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> PASS.

## Validation Evidence (Continuation 2026-04-08)
- `get_errors` on touched files -> PASS.
- `npm run test -- tests/unit/hooks/useHomeContentDnd.test.js tests/unit/components/CustomScrollbar.test.jsx tests/unit/pages/theme-preview/ThemePreview.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> PASS.
