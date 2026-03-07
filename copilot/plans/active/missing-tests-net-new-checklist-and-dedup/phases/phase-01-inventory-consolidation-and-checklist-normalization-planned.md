<!-- copilot/plans/todo/missing-tests-net-new-checklist-and-dedup/phases/phase-01-inventory-consolidation-and-checklist-normalization-planned.md -->
# Phase 01 - Inventory Consolidation and Checklist Normalization

Status: **IN_PROGRESS**

## Objective
Produce two clean planning artifacts:
- a net-new missing test checklist,
- a deduplicated existing todo checklist.

## Planned Changes
- Add `tests/missing-tests-net-new.md`.
- Edit `tests/todo-tests.md` to remove duplicated bullets and keep section readability.

## Risks
- Accidental removal of unique scenarios due to semantic overlap.
- Drifting from the original scope by adding implementation details.

## Completion Criteria
- New net-new checklist file exists with actionable entries.
- Legacy todo file contains no repeated blocks.
- `get_errors` reports clean state for touched markdown files.

## Execution Notes
- Created `tests/missing-tests-net-new.md` with net-new actionable scenarios.
- Deduplicated repeated sections in `tests/todo-tests.md` and preserved unique checklist intent.
