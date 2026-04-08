<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/phases/phase-01-selection-mode-drag-drop-and-dedup.md -->
# Phase 01 - Selection Mode Drag/Drop and De-dup

## Status
- IN_PROGRESS

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

## Validation Evidence (2026-04-08)
- `get_errors` on touched files -> PASS.
- `npm run test -- tests/unit/pages/home/HomeMainContent.test.jsx tests/unit/pages/topic/TopicTabs.createActions.test.jsx tests/unit/hooks/useTopicLogic.test.js` -> PASS.
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> PASS.
