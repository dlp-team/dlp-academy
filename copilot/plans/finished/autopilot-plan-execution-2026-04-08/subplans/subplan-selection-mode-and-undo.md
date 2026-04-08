<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-08/subplans/subplan-selection-mode-and-undo.md -->
# Subplan: Selection Mode and Undo

## Objective
Enable selection mode parity with individual drag/drop behavior and ensure post-action undo behavior works consistently.

## Requested Outcomes
- Batch-selected elements can be dragged and dropped like individual elements.
- Shared-folder move confirmation applies to all selected items.
- Selection mode UI rules:
  - exit button border linked to primary color,
  - create-subject button disabled/no-op while active,
  - child selection unselects containing folder to avoid duplication.

## Candidate Target Files
- `src/pages/Home/**`
- `src/components/modules/**`
- `src/hooks/**` (selection and drag-drop state handlers)

## Risks
- Duplicate selection payloads causing move/delete inconsistencies.
- Folder-child state conflicts causing unexpected UI badge counts.

## Validation
- Selection-mode interaction tests.
- Manual grid/list parity checks.
- `get_errors` + targeted unit tests.
