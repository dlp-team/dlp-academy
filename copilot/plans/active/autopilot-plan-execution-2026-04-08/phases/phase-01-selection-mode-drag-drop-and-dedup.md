<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/phases/phase-01-selection-mode-drag-drop-and-dedup.md -->
# Phase 01 - Selection Mode Drag/Drop and De-dup

## Status
- PLANNED

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
