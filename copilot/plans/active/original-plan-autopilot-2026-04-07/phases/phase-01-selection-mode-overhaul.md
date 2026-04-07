<!-- copilot/plans/active/original-plan-autopilot-2026-04-07/phases/phase-01-selection-mode-overhaul.md -->
# Phase 01 - Selection Mode Overhaul

## Status
- active

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
