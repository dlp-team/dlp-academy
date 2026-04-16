<!-- copilot/explanations/temporal/lossless-reports/2026-04-10/phase01-phase02-selection-dnd-undo-fixes.md -->
# Lossless Report - Phase 01/02 Selection DnD and Undo Fixes (2026-04-10)

## Requested Scope
- Continue active plan implementation for selection-mode parity and undo reliability.
- Ensure selected-item dragging behaves as grouped movement (visual + routing).
- Keep `Crear Nueva Asignatura` visible in selection mode but non-operative on click.
- Prevent undo from re-enabling selection mode.
- Restore sharing state when undoing moves that crossed shared-folder boundaries.

## Preserved Behaviors
- Existing single-item drag/drop payload and routing semantics are preserved.
- Existing selection toolbar actions and 5-second undo toast lifecycle are preserved.
- Existing shortcut undo pipeline and toast component behavior are preserved.
- Existing shared-folder permission checks and move confirmation gates remain unchanged.

## Touched Files
- `src/hooks/useGhostDrag.ts`
- `src/components/modules/SubjectCard/SubjectCard.tsx`
- `src/components/modules/FolderCard/FolderCard.tsx`
- `src/components/modules/ListViewItem.tsx`
- `src/components/modules/ListItems/FolderListItem.tsx`
- `src/pages/Home/components/HomeContent.tsx`
- `src/pages/Home/components/HomeMainContent.tsx`
- `src/pages/Home/components/HomeEmptyState.tsx`
- `src/pages/Home/hooks/useHomeBulkSelection.ts`
- `tests/unit/hooks/useHomeBulkSelection.test.js`

## Per-File Verification
- `useGhostDrag`: now supports stacked multi-selection drag ghost rendering with count badge while retaining previous single-item ghost behavior.
- `SubjectCard`, `FolderCard`, `ListViewItem`, `FolderListItem`: now provide selection-aware `multiDragCount` context and selection keys to drag roots.
- `HomeContent`: now routes grid folder drops through selection-aware wrappers and keeps create-subject cards visible with inert click behavior in selection mode.
- `HomeMainContent` + `HomeEmptyState`: create-state visibility remains available during selection mode while click action is safely blocked.
- `useHomeBulkSelection`: undo snapshot now stores sharing metadata and restores it; undo no longer re-enters selection mode.
- `useHomeBulkSelection.test.js`: regression coverage added for sharing metadata restoration and selection-mode non-reactivation.

## Validation Summary
- `get_errors` on all touched source/test files: PASS (no errors).
- `npm run test -- tests/unit/hooks/useHomeBulkSelection.test.js tests/unit/hooks/useHomeContentDnd.test.js tests/unit/components/FolderCard.test.jsx tests/unit/components/ListViewItem.selectionDimming.test.jsx`: PASS (20 tests).
