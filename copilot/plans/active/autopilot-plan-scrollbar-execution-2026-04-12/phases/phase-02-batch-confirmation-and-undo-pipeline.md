<!-- copilot/plans/active/autopilot-plan-scrollbar-execution-2026-04-12/phases/phase-02-batch-confirmation-and-undo-pipeline.md -->
# Phase 02 - Batch Confirmation and Undo Pipeline

## Objective
Guarantee that batch operations and undo behavior are complete, transparent, and all-item consistent.

## Scope
- Batch confirmation copy:
  - Include affected item names in confirmation UI when item count <= 5.
  - When item count > 5, show total count + first five names + overflow marker.
- Undo behavior:
  - A single undo action restores all affected items from the batch operation.
  - Preserve location, sharing metadata, and type-specific fields.
  - Keep notification/undo card semantics consistent with batch context.

## Primary File Surfaces
- `src/pages/Home/hooks/useHomeBulkSelection.ts`
- `src/pages/Home/components/HomeMainContent.tsx`
- `src/pages/Home/components/HomeContent.tsx`
- `src/pages/Home/utils/homeSelectionDropUtils.ts`

## Acceptance Criteria
- Batch confirmation content is deterministic and readable.
- Batch undo restores full group state, not partial state.

## Validation
- Unit tests for payload formatting and batch undo replay.
- Regression pass on move/delete batch actions.