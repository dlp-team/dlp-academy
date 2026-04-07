<!-- copilot/plans/active/original-plan-autopilot-2026-04-07/phases/phase-01-selection-mode-overhaul.md -->
# Phase 01 - Selection Mode Overhaul

## Status
- inReview

## Objectives
- Exclude selected folders (and their nested disallowed destinations) from move-to destination options.
- Centralize share/unshare confirmation rules and reuse for batch move actions.
- Fix list mode click behavior in selection mode (toggle select instead of navigation/open).
- Add primary-color border on "Salir de la seleccion" button.
- Add Ctrl+Z undo for last selection action and 5-second bottom undo notification.

## Validation
- get_errors on touched Home/selection files.
- Targeted tests for selection-mode utilities and interaction handlers.
- Manual pass: grid/list behavior in all tabs including bin.

## Outcome (In Review)
- Implemented filtered move destinations that exclude selected folders and descendants.
- Routed batch move entries through centralized share-rule orchestration for single-item parity.
- Fixed list-mode selection-mode click behavior for nested subject and folder rows.
- Added primary token border styling to the selection-exit action.
- Added Ctrl+Z undo recovery with floating 5-second action feedback.
- Validation completed for targeted tests and `get_errors`; phase is pending commit/push gate completion.
