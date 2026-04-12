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

## Execution Status
- Status: COMPLETED (2026-04-12)
- Implemented modifier-click parity in Home content interactions:
  - Ctrl/Cmd+click outside selection mode now enters selection mode and selects clicked item.
  - Ctrl/Cmd+click on an already-selected item in selection mode now navigates while preserving selection state.
  - Ctrl/Cmd+Shift+click now applies contiguous range selection from anchor to target using rendered DOM order.
- Propagated pointer event context through Home card/list module surfaces to avoid regressions in existing click actions.
- Added focused unit coverage for modifier behaviors in list mode.

## Implemented File Surfaces
- `src/pages/Home/components/HomeContent.tsx`
- `src/pages/Home/components/HomeMainContent.tsx`
- `src/pages/Home/Home.tsx`
- `src/components/modules/FolderCard/FolderCard.tsx`
- `src/components/modules/SubjectCard/SubjectCardFront.tsx`
- `src/components/modules/ListItems/FolderListItem.tsx`
- `src/components/modules/ListItems/SubjectListItem.tsx`
- `src/components/modules/ListViewItem.tsx`
- `tests/unit/pages/home/HomeContent.selectionModifiers.test.jsx`

## Acceptance Criteria
- Grouped drag/drop result equals multi-item move from one gesture.
- Modifier interactions are deterministic across grid and list modes.

## Validation
- Targeted Home selection and DnD tests.
- Manual parity in grid/list/tree contexts.