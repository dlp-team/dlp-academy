<!-- copilot/plans/active/autopilot-plan-execution-2026-04-10/phases/phase-01-selection-mode-dnd-and-visual-parity.md -->
# Phase 01 - Selection Mode DnD and Visual Parity

## Status
- IN_PROGRESS

## Objective
Make selection-mode grouped drag/drop behavior equivalent to individual item behavior while preserving multi-selection semantics and visual feedback.

## Scope
- Grouped drag payload uses all selected elements (not just drag origin).
- Group ghost reflects full selected set.
- Group move target behavior matches individual move rules.
- Keep `Crear nueva asignatura` visible but inert during selection mode.
- Fix clipped selected-border rendering in nested list selections.

## Risks
- Drag payload regressions can break single-item behavior.
- Selection-state mutations can desync visual and logical selection sets.

## Exit Criteria
- [ ] Group drag-drop parity verified in grid/list/tree paths.
- [x] Group ghost shows selected-set representation.
- [x] `Crear nueva asignatura` remains visible and non-operative in selection mode.
- [x] Nested list selected-border clipping fixed.
- [ ] No regression in non-selection drag/drop.

## Implementation Update (2026-04-10)
- Added multi-selection ghost drag visuals through `useGhostDrag` with stacked card layers and total-count badge when dragging a selected item from a multi-selection.
- Wired selection-aware drop handling for grid folder targets so dropping a selected subject/folder routes to batch move (`onDropSelectedItems`) instead of single-item move.
- Kept `Crear Nueva Asignatura` cards visible in selection mode across grid/list/empty states while making click actions inert.
- Relaxed nested list children clipping (`overflow-visible` + bottom spacing) to avoid selection ring crop artifacts in deep list branches.
- Added stateful nested children-wrapper overflow behavior in [src/components/modules/ListItems/FolderListItem.tsx](../../../../../src/components/modules/ListItems/FolderListItem.tsx) so collapsed folders clip content (`overflow-hidden pb-0`) while expanded folders preserve ring-safe spacing (`overflow-visible pb-1`).
- Added collapse-spacing regression coverage in [tests/unit/components/FolderListItem.collapseSpacing.test.jsx](../../../../../tests/unit/components/FolderListItem.collapseSpacing.test.jsx).
