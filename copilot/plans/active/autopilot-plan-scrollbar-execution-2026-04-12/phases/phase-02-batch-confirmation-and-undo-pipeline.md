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
- `src/pages/Home/hooks/useHomePageHandlers.ts`
- `src/pages/Home/components/HomeShareConfirmModals.tsx`
- `src/pages/Home/hooks/useHomePageState.tsx`

## Execution Status
- Status: COMPLETED (2026-04-12)
- Implemented deterministic batch preview payload shaping with max-five names + overflow count helper.
- Propagated shared batch preview payload through selection-move orchestration and deferred confirmation flows.
- Rendered share/unshare confirmation modal batch preview UI for multi-item operations.
- Preserved single-item confirmation copy behavior (no extra preview block).

## Implemented File Surfaces
- `src/pages/Home/utils/homeBatchConfirmationUtils.ts`
- `src/pages/Home/hooks/useHomeBulkSelection.ts`
- `src/pages/Home/hooks/useHomePageHandlers.ts`
- `src/pages/Home/hooks/useHomePageState.tsx`
- `src/pages/Home/components/HomeShareConfirmModals.tsx`
- `tests/unit/utils/homeBatchConfirmationUtils.test.js`
- `tests/unit/pages/home/HomeShareConfirmModals.test.jsx`

## Acceptance Criteria
- Batch confirmation content is deterministic and readable.
- Batch undo restores full group state, not partial state.

## Validation
- Unit tests for payload formatting and batch undo replay.
- Regression pass on move/delete batch actions.
- Executed and passed:
  - `tests/unit/utils/homeBatchConfirmationUtils.test.js`
  - `tests/unit/pages/home/HomeShareConfirmModals.test.jsx`
  - `tests/unit/hooks/useHomeBulkSelection.test.js`
  - `tests/unit/pages/home/HomeContent.selectionModifiers.test.jsx`
  - `tests/unit/pages/home/HomeMainContent.test.jsx`
  - `tests/unit/pages/home/**` (broader Home regression subset)