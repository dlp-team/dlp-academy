<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-02-selection-and-bin-block-d.md -->
# Lossless Report - Phase 02 Selection and Bin Block D

## 1. Requested Scope
- Continue Phase 02 after leverage prompt selected continuation.
- Address Home list-mode nested selection emphasis parity.
- Add focused contract tests for recursive list selection/dimming behavior.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No changes to Bin runtime behavior in this block.
- No changes to permission checks, data APIs, or bulk action handlers.
- No changes to selection-key format (`type:id` / `type:shortcutId`).

## 3. Touched Files
- [src/components/modules/ListViewItem.tsx](src/components/modules/ListViewItem.tsx)
- [src/components/modules/ListItems/FolderListItem.tsx](src/components/modules/ListItems/FolderListItem.tsx)
- [src/pages/Home/components/HomeContent.tsx](src/pages/Home/components/HomeContent.tsx)
- [tests/unit/components/ListViewItem.selectionDimming.test.jsx](tests/unit/components/ListViewItem.selectionDimming.test.jsx)
- [copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/README.md](copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/README.md)
- [copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/phases/phase-02-selection-mode-and-bin-unification.md](copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/phases/phase-02-selection-mode-and-bin-unification.md)
- [copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md](copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md)
- [copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/user-updates.md](copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/user-updates.md)
- [copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/working/phase-02-selection-and-bin-kickoff.md](copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/working/phase-02-selection-and-bin-kickoff.md)
- [copilot/explanations/codebase/src/components/modules/ListViewItem.md](copilot/explanations/codebase/src/components/modules/ListViewItem.md)
- [copilot/explanations/codebase/src/components/modules/ListItems/FolderListItem.md](copilot/explanations/codebase/src/components/modules/ListItems/FolderListItem.md)
- [copilot/explanations/codebase/src/pages/Home/components/HomeContent.md](copilot/explanations/codebase/src/pages/Home/components/HomeContent.md)
- [copilot/explanations/codebase/tests/unit/components/ListViewItem.selectionDimming.test.md](copilot/explanations/codebase/tests/unit/components/ListViewItem.selectionDimming.test.md)

## 4. Per-File Verification
- [src/components/modules/ListViewItem.tsx](src/components/modules/ListViewItem.tsx)
  - Added optional selection-context inputs to compute selected state from shared key sets.
  - Applied Home dimming helper only when enabled by caller.
  - Preserved existing behavior for consumers that do not provide selection-dimming props.
- [src/components/modules/ListItems/FolderListItem.tsx](src/components/modules/ListItems/FolderListItem.tsx)
  - Added row-level `dimmingClass` application to avoid dimming full subtree wrappers.
  - Forwarded selection-context props to recursive list children.
- [src/pages/Home/components/HomeContent.tsx](src/pages/Home/components/HomeContent.tsx)
  - Wired list-mode rows to pass selection context for recursive parity.
- [tests/unit/components/ListViewItem.selectionDimming.test.jsx](tests/unit/components/ListViewItem.selectionDimming.test.jsx)
  - Validates subject row dimming/selection ring logic and folder-row dimming contract propagation.

## 5. Risks and Checks
- Risk: changes to generic `ListViewItem` could affect Bin list rendering.
  - Check: behavior is gated behind `enableSelectionDimming` (default `false`), preserving existing Bin semantics.
- Risk: nested folder recursion could miss selection-context propagation.
  - Check: context is forwarded in both recursive folder and subject branches.

## 6. Validation Summary
- Diagnostics:
  - `get_errors` clean for all touched source/test files.
- Targeted tests:
  - `npm run test -- tests/unit/components/ListViewItem.selectionDimming.test.jsx tests/unit/pages/home/BinView.listInlinePanel.test.jsx tests/unit/components/BinSelectionOverlay.test.jsx tests/unit/components/BinGridItem.test.jsx tests/unit/utils/selectionVisualUtils.test.js tests/unit/pages/home/HomeMainContent.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.

