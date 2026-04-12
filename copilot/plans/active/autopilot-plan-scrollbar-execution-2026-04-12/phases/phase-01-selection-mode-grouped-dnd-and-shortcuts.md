<!-- copilot/plans/active/autopilot-plan-scrollbar-execution-2026-04-12/phases/phase-01-selection-mode-grouped-dnd-and-shortcuts.md -->
# Phase 01 - Selection Mode Grouped DnD and Shortcuts

## Objective
Bring selection mode to grouped drag/drop parity and modifier-key interaction parity (Ctrl and Ctrl+Shift behaviors).

## Scope
- Grouped drag behavior:
  - Dragging one selected item drags all selected items as one action.
  - Non-origin selected items transition toward drag origin before ghost handoff.
  - Ghost representation reflects grouped selection stack.
  - Non-ghost selected cards hide during active drag to avoid duplicate visuals.
- Shortcut behavior:
  - Ctrl+click outside selection mode enters selection mode and selects clicked item.
  - Ctrl+click inside selection mode navigates into selected subject/folder while preserving selection mode.
  - Ctrl+Shift+click selects contiguous range from selection anchor.

## Primary File Surfaces
- `src/pages/Home/hooks/useHomeBulkSelection.ts`
- `src/pages/Home/hooks/useHomeContentDnd.ts`
- `src/hooks/useGhostDrag.ts`
- `src/pages/Home/components/HomeMainContent.tsx`

## Acceptance Criteria
- Grouped drag/drop result equals multi-item move from one gesture.
- Modifier interactions are deterministic across grid and list modes.

## Validation
- Targeted Home selection and DnD tests.
- Manual parity in grid/list/tree contexts.