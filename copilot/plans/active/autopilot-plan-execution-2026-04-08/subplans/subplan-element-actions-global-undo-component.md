<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/subplans/subplan-element-actions-global-undo-component.md -->
# Subplan: Global Element Action Undo Component

## Objective
Centralize undo notification UX and extend undo to drag/drop and other element actions (except creation).

## Requested Outcomes
- Reusable undo notification component for bottom placement.
- 5-second visible undo prompt for confirmable actions.
- Ctrl+Z remains available until next undoable action replaces stack head.
- Shared integration across selection-mode and non-selection actions.

## Candidate Target Files
- `src/components/ui/**` (new reusable component)
- `src/hooks/**` (undo stack management)
- `src/pages/Home/**`

## Risks
- Inconsistent action payload shape across move/delete/drag-drop operations.
- Race conditions when multiple actions occur quickly.

## Validation
- Deterministic undo stack tests.
- Keyboard + toast undo parity checks.
- No undo support for creation actions.
