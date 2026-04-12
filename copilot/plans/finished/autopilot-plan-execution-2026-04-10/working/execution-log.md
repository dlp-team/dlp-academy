<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-10/working/execution-log.md -->
# Execution Log

## 2026-04-11
- Synced new user update referencing the active plan plus root source files [AUTOPILOT_PLAN.md](../../../../../AUTOPILOT_PLAN.md) and [SCROLLBAR_FIX.md](../../../../../SCROLLBAR_FIX.md).
- Created dedicated scrollbar follow-up subplan: [subplans/scrollbar-global-follow-up-2026-04-11.md](../subplans/scrollbar-global-follow-up-2026-04-11.md).
- Reopened Phase 05 from `IN_REVIEW` to `IN_PROGRESS` and started cross-route scrollbar harmonization execution.
- Scrollbar implementation block:
	- Added global `.custom-scrollbar` rules in [src/index.css](../../../../../src/index.css) using shared scrollbar CSS variables.
	- Removed local `.custom-scrollbar` style overrides in [src/pages/Content/Exam.tsx](../../../../../src/pages/Content/Exam.tsx), [src/pages/Content/Formula.tsx](../../../../../src/pages/Content/Formula.tsx), and [src/pages/Content/StudyGuide.tsx](../../../../../src/pages/Content/StudyGuide.tsx).
- Validation updates:
	- `get_errors` on touched files -> PASS (unchanged baseline CSS-language warnings for `@theme/@variant`).
	- `npm run test:unit -- tests/unit/components/CustomScrollbar.test.jsx` -> PASS (1/1 tests).
	- `npm run test:unit -- tests/unit/pages/content/Exam.test.jsx tests/unit/pages/content/StudyGuide.fallback.test.jsx tests/unit/pages/content/StudyGuide.navigation.test.jsx` -> PASS (8/8 tests).
	- `npm run lint` -> PASS.
	- `npx tsc --noEmit` -> FAIL due unrelated pre-existing errors in [src/hooks/useGhostDrag.ts](../../../../../src/hooks/useGhostDrag.ts#L80).

- Phase 02 parity completion block:
	- Added Ctrl+Z-specific undo parity coverage in [tests/unit/hooks/useHomeBulkSelection.test.js](../../../../../tests/unit/hooks/useHomeBulkSelection.test.js) to verify keyboard shortcut uses the same undo callback as toast action.
	- Added guard test confirming Ctrl+Z no-ops when no undo toast payload exists.
	- Phase 02 status promoted to `IN_REVIEW` after full exit-criteria evidence closure.
- Validation updates for Phase 02 parity block:
	- `npm run test:unit -- tests/unit/hooks/useHomeBulkSelection.test.js` -> PASS (8/8 tests).

- Phase 01 parity completion block:
	- Added selected-subject root-drop batch-routing coverage in [tests/unit/hooks/useHomeContentDnd.test.js](../../../../../tests/unit/hooks/useHomeContentDnd.test.js) to prove tree-path select-mode parity.
	- Added non-selected subject regression guard in select mode to ensure standard single-item drop path still executes when dragged key is outside the selected set.
	- Phase 01 status promoted to `IN_REVIEW` after completing remaining automated exit criteria.
- Validation updates for Phase 01 parity block:
	- `npm run test:unit -- tests/unit/hooks/useHomeContentDnd.test.js` -> PASS (11/11 tests).

- Validation recovery block (TypeScript gate):
	- Fixed type mismatch in [src/hooks/useGhostDrag.ts](../../../../../src/hooks/useGhostDrag.ts) by assigning `dataset` values as strings for ghost scale metadata.
	- Corrected file path header comment in `useGhostDrag.ts` to match TypeScript file extension.
- Validation updates for TypeScript recovery block:
	- `npm run test:unit -- tests/unit/hooks/useGhostDrag.test.js` -> PASS (13/13 tests).
	- `npx tsc --noEmit` -> PASS.
	- `npm run lint` -> PASS.

- Selection-mode empty-state parity block:
	- Updated [tests/unit/pages/home/HomeMainContent.test.jsx](../../../../../tests/unit/pages/home/HomeMainContent.test.jsx) expectation to assert the intended contract: create action remains visible but inert during selection mode.

- Final validation matrix + Phase 06 closure block:
	- `npm run test:unit -- tests/unit/pages/home/HomeMainContent.test.jsx` -> PASS.
	- `npm run lint` -> PASS.
	- `npx tsc --noEmit` -> PASS.
	- `npm run test` -> PASS (165/165 files, 762/762 tests).
	- `npm run build` -> PASS (chunk-size warning only).
	- Logged chunk-size warning follow-up in [copilot/plans/out-of-scope-risk-log.md](../../../out-of-scope-risk-log.md).
	- Promoted Phase 06 to `IN_REVIEW` and synchronized verification checklist to Step 16 readiness.

## 2026-04-10
- Completed required pre-plan governance updates from source Notes section.
- Created active plan package for new root AUTOPILOT source.
- Prepared phase map and validation gates for Step 7 onward execution.
- Phase 01 implementation block:
	- Added stacked multi-selection drag ghost support in `src/hooks/useGhostDrag.ts`.
	- Propagated selection context into card/list draggable components for multi-selection ghost rendering.
	- Added selection-aware grid folder drop wrappers in `HomeContent` so selected items move as a batch.
	- Kept create-subject cards visible in selection mode while making click actions inert.
	- Adjusted nested list container clipping in `FolderListItem` to prevent selected-ring crop.
- Phase 02 implementation block:
	- Extended bulk undo snapshots with sharing metadata.
	- Restored prior sharing state during undo for subject/folder moves.
	- Prevented selection mode from auto-reactivating after bulk undo.
- Validation:
	- `get_errors` on touched files -> PASS.
	- `npm run test -- tests/unit/hooks/useHomeBulkSelection.test.js tests/unit/hooks/useHomeContentDnd.test.js tests/unit/components/FolderCard.test.jsx tests/unit/components/ListViewItem.selectionDimming.test.jsx` -> PASS (20 tests).

- Phase 03 implementation block:
	- Adjusted `BinGridItem` selected-card hide path to use `invisible` + transform-only transition semantics, preventing flicker/invisibility artifacts when pressing an already selected grid card.
	- Verified list press-state parity guard by asserting no opacity mutation on selected wrappers in `BinView.listPressState` tests.
	- Replaced Home inline action/shortcut feedback banners with reusable `AppToast` notifications pinned in fixed lower-left space (`bottom-24 left-5`) to avoid page layout shift.
	- Extended `AppToast` with optional position override and optional close-button rendering for cross-surface reuse.
- Validation updates for Phase 03 block:
	- `get_errors` on touched source/test files -> PASS.
	- `npm run test -- tests/unit/components/AppToast.test.jsx tests/unit/components/BinGridItem.test.jsx tests/unit/components/BinSelectionOverlay.test.jsx tests/unit/components/BinView.listPressState.test.jsx` -> PASS (12 tests).

- Phase 04 implementation block:
	- Refactored `src/pages/ThemePreview/ThemePreview.tsx` to render real `Home` route composition using message-delivered preview user context instead of hardcoded preview datasets/components.
	- Added preview-user payload propagation through customization stack (`InstitutionAdminDashboard` -> `CustomizationTab` -> `InstitutionCustomizationMockView` -> `buildInstitutionPreviewThemeMessage`).
	- Extended theme preview message builder to include sanitized user context while preserving existing CSS/highlight payload behavior.
	- Removed nested scrolling in customization preview pane by moving right-side preview container to `overflow-hidden` so iframe content controls scroll.
- Validation updates for Phase 04 block:
	- `get_errors` on touched source/test files -> PASS.
	- `npm run test -- tests/unit/pages/theme-preview/ThemePreview.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx tests/unit/pages/institution-admin/themePreviewUtils.messagePayload.test.js` -> PASS (30 tests).
	- `npm run test -- tests/unit/pages/theme-preview/ThemePreview.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS (28 tests).

- Phase 05 implementation block:
	- Updated global scrollbar variables to deterministic gray RGBA tokens for cleaner light/dark parity and reliable runtime updates.
	- Removed fixed scrollbar gutter background colors and corrected dark selector coverage in `src/index.css` to keep track surfaces transparent and synchronized on theme switch.
	- Tightened `Solo Vigentes` filtering in `src/hooks/useHomeState.ts`:
		- requires current academic year records,
		- enforces lifecycle-active visibility,
		- validates active period-window membership when subject period metadata exists.
	- Updated hook tests to align with strict current-year policy and added active-period window coverage.
- Validation updates for Phase 05 block:
	- `get_errors` on touched source/test files -> PASS.
	- `npm run test -- tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx tests/unit/components/CustomScrollbar.test.jsx` -> PASS (16 tests).

- User-updates remediation + Phase 02 continuation block:
	- Fixed collapsed-folder blank-space leakage in list mode by making nested children wrappers stateful (`overflow-hidden pb-0` collapsed, `overflow-visible pb-1` expanded) in [src/components/modules/ListItems/FolderListItem.tsx](../../../../../src/components/modules/ListItems/FolderListItem.tsx).
	- Added dedicated regression suite [tests/unit/components/FolderListItem.collapseSpacing.test.jsx](../../../../../tests/unit/components/FolderListItem.collapseSpacing.test.jsx) for collapsed/expanded wrapper class transitions.
	- Hardened scrollbar artifact suppression in [src/index.css](../../../../../src/index.css) by forcing transparent track/track-piece surfaces, hiding scrollbar buttons, and neutralizing resizer/corner backgrounds.
	- Continued Phase 02 parity work by adding mixed subject+folder undo restoration assertions in [tests/unit/hooks/useHomeBulkSelection.test.js](../../../../../tests/unit/hooks/useHomeBulkSelection.test.js).
- Validation updates for user-updates remediation block:
	- `get_errors` on touched source/test files -> PASS.
	- `npm run test:unit -- tests/unit/hooks/useHomeBulkSelection.test.js` -> PASS (6 tests).
	- `npm run test:unit -- tests/unit/components/FolderListItem.collapseSpacing.test.jsx tests/unit/components/ListViewItem.selectionDimming.test.jsx tests/unit/components/CustomScrollbar.test.jsx tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/hooks/useHomeBulkSelection.test.js` -> PASS (23 tests).
