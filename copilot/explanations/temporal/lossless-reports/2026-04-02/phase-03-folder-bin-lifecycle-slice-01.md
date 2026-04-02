<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-03-folder-bin-lifecycle-slice-01.md -->
# Lossless Report - Phase 03 Folder Bin Lifecycle Slice 01

## Requested Scope
- Continue plan execution focused on "Papelera y eliminacion".
- Convert folder "delete with contents" from hard delete to bin-first behavior.
- Surface folder containers in bin and support restore/permanent delete actions.
- Complete nested subfolder-specific individual actions inside bin drilldown.

## Preserved Behaviors
- `deleteFolderOnly` keeps existing behavior: remove only selected folder and re-parent children.
- Subject-only bin features remain available (description modal, urgency ordering, empty-bin flow).
- Owner-scoped shortcut cleanup remains best-effort and non-blocking.
- Student role still cannot access bin view.

## Implemented Changes
1. Folder lifecycle in `useFolders`:
   - `deleteFolder` now performs soft-delete cascade with trash metadata.
   - Added `getTrashedFolders`, `restoreFolder`, `permanentlyDeleteFolder`.
   - Added chunked batch helper for large subtree operations.
   - Active folder subscription excludes trashed folders from normal Home views.
2. Bin UI and actions:
   - `BinView` now loads typed bin items (`subject`, `folder`) and hides subjects nested inside trashed folders from top-level view.
   - Added bin folder drilldown so selecting a trashed folder can open its internal trashed subject items.
   - Added hierarchical folder drilldown so nested trashed subfolders can be opened level by level with back navigation.
   - Added typed restore/permanent-delete handling and type-aware list/grid selection behavior.
   - Selection overlays/panels and confirmation modals now support folder targets.
3. Tests:
   - Updated legacy `deleteFolder` assertions from hard delete to soft-delete metadata updates.
   - Added coverage for `getTrashedFolders`, `restoreFolder`, `permanentlyDeleteFolder`.
   - Added nested subtree coverage to ensure nested-folder restore/delete does not affect sibling branches.

## Touched Files
- `src/hooks/useFolders.ts`
- `src/pages/Home/components/BinView.tsx`
- `src/pages/Home/components/bin/BinGridItem.tsx`
- `src/pages/Home/components/bin/BinSelectionPanel.tsx`
- `src/pages/Home/components/bin/BinSelectionOverlay.tsx`
- `src/pages/Home/components/bin/BinConfirmModals.tsx`
- `tests/unit/hooks/useFolders.test.js`
- `copilot/explanations/codebase/src/hooks/useFolders.md`
- `copilot/explanations/codebase/src/pages/Home/components/BinView.md`
- `copilot/explanations/codebase/tests/unit/hooks/useFolders.test.md`
- `copilot/explanations/codebase/src/pages/Home/components/bin/BinGridItem.md`
- `copilot/explanations/codebase/src/pages/Home/components/bin/BinSelectionPanel.md`
- `copilot/explanations/codebase/src/pages/Home/components/bin/BinSelectionOverlay.md`
- `copilot/explanations/codebase/src/pages/Home/components/bin/BinConfirmModals.md`

## Validation Summary
- `get_errors` on touched source/test files: clean.
- `npm run test -- tests/unit/hooks/useFolders.test.js tests/unit/hooks/useHomeHandlers.shortcuts.test.js tests/unit/hooks/useHomeLogic.test.js`: passed (56 tests).
- `npm run lint`: passed with pre-existing warnings only (no new errors).
- `npx tsc --noEmit`: passed.

## Residual / Next Slice
- Institution admin course/class deletion architecture in bin remains pending in later Phase 03 work.
