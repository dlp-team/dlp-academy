# Phase 5 — Selection Mode Drag Bug Fix

## Status: DONE

## Bug Description
When selection mode is active and **more than 6 elements** are selected, dragging works correctly for the first 6 selected elements (ghost/transition applied), but the remaining elements beyond 6 (`n - 6` where n > 6) do **not** transition and do not enter ghost mode during drag.

## Root Cause Hypothesis
The drag preview or ghost rendering likely caps at 6 elements. This could be:
- A hardcoded `slice(0, 6)` or `Math.min(count, 6)` in the drag ghost generator
- A CSS animation/transition limit (e.g., only first 6 `.selected-item` children get the ghost class)
- A performance guard that limits how many items enter the drag-transform state

## Files Likely Touched
- `src/pages/Home/` — selection mode logic, DragProvider or similar
- `src/hooks/useDragSelection.ts` or drag-related hook
- `src/components/` — drag ghost component

## Acceptance Criteria
- [x] Selecting >6 items and dragging applies ghost mode / transition to ALL selected items
- [x] Visual consistency: all selected items behave identically during drag regardless of count
- [x] No performance regression for large selections

## Completion Notes
- Root cause confirmed: `resolveSelectedCompanionNodes` in `src/hooks/useGhostDrag.ts` capped companions at `MAX_MULTI_GHOST_PREVIEW - 1` (5), used for both staging AND ghost preview.
- Fix: added optional `maxNodes` parameter (default = cap) to `resolveSelectedCompanionNodes`.
- In `handleDragStartWithCustomImage`: introduce `allCompanionNodes = resolveSelectedCompanionNodes(selectionKey, null)` (uncapped) used for `stageCompanionNodesTowardLead`, while `selectedCompanionNodes` (capped) is retained for `createMultiGhost` visual preview only.
- Ghost preview stack still shows max 6 cards (UX unchanged); ALL items beyond 6 now correctly enter ghost mode (opacity:0 + translate toward lead).

## Validation
- [ ] Manual test: select 7, 10, 15 items and drag — all should ghost correctly
- [ ] `npm run test` passes

## Commits Required (minimum)
1. `fix(selection-mode): Apply drag ghost transition to all selected items beyond 6`
