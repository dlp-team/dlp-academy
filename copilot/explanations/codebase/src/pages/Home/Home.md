# Home.jsx

## Changelog
- **2026-04-10:** Replaced in-flow Home feedback banners (`HomeShortcutFeedback` / `HomeBulkActionFeedback` render path) with fixed reusable `AppToast` notifications positioned above undo toasts, preventing content layout shifts when feedback messages appear.
- **2026-04-09:** Added selection-aware grouped-drop wrappers for upward and breadcrumb drop targets so dragging a selected card routes to `runBulkMoveToFolder(...)` instead of single-item move handlers.
- **2026-04-08:** Forwarded `runBulkMoveToFolder` into `HomeMainContent` so selected drag/drop operations route through the same batch move confirmation/share-rule flow as toolbar-triggered bulk moves.
- **2026-04-08:** Integrated keyboard/page undo convergence in `Home.tsx` by wiring `registerUndoAction` from keyboard coordination into page handlers and replacing floating undo feedback rendering with shared `UndoActionToast` surface.
- **2026-04-07:** Selection-mode flow now delegates batch move entries to centralized share-rule handlers, uses filtered move destinations from `useHomeBulkSelection`, and renders a floating undo feedback surface for Ctrl+Z-based action recovery.
- **2026-04-03:** Wired `subjectPeriodFilter`, `setSubjectPeriodFilter`, and `availableSubjectPeriods` from `useHomeLogic` into `HomeControls` to expose persisted period filtering in `usage`/`courses` modes.
- **2026-04-02:** Passed `publishHomeFeedback` into `useHomePageHandlers` so shortcut move-request callable outcomes are shown in the existing Home feedback banner.
- **2026-04-02:** Wired persisted `showOnlyCurrentSubjects` lifecycle visibility state from `useHomeLogic` into `HomeControls` for courses/usage active-only filtering.
- **2026-04-02:** Wired courses-tab academic-year filter state (`coursesAcademicYearFilter`, setter, and available years) from `useHomeLogic` into `HomeControls` for persistent year-range filtering UX.
- **2026-04-01:** Wired `teacherSubjectCreationAllowed` from `useHomeLogic` into `useHomeCreationGuards`, making Home subject-create controls respect institution teacher-creation policy.
- **2026-04-01:** Extracted inline bulk-action feedback banner into `HomeBulkActionFeedback.tsx`, preserving tone-specific visual semantics and empty-message guard behavior while reducing coordinator JSX in `Home.tsx`.
- **2026-04-01:** Extracted creation/content guard derivations into `useHomeCreationGuards.ts`, preserving permission checks while reducing inline `useMemo` blocks in `Home.tsx`.
- **2026-04-01:** Extracted the Home view-mode content branch into `HomeMainContent.tsx`, preserving `bin/shared/manual` behavior while reducing coordinator complexity in `Home.tsx`.
- **2026-04-01:** Extracted keyboard feedback coordination into `useHomeKeyboardCoordination.ts` and moved feedback banner UI into `HomeShortcutFeedback.tsx` to keep `Home.tsx` orchestration-focused.
- **2026-04-01:** Extracted control-tag derivation and selected-tag pruning into `useHomeControlTags.ts` to reduce `Home.tsx` memo/effect density while preserving shared/manual tag behavior.
- **2026-04-01:** Extracted both bootstrap and inline loading shells into `HomeLoader.tsx` so `Home.tsx` no longer owns loading presentation markup.
- **2026-04-01:** Extracted bulk selection orchestration from `Home.tsx` into `useHomeBulkSelection.ts`, preserving toolbar behaviors (move/delete/create-folder-from-selection), partial-failure handling, and mode-based selection reset.
- **2026-03-13:** Bulk selection actions now auto-exit selection mode after execution (delete, move, and create-folder-from-selection).
- **2026-03-13:** Extracted selection toolbar UI into `HomeSelectionToolbar` component to keep `Home.jsx` orchestration-focused while preserving existing bulk-selection behavior.
- **2026-03-13:** Added `Modo selección` workflow in Home manual views with bulk actions for selected cards: delete selected, move selection to existing folder/root, and create new folder with selected elements.
- **2026-03-12:** Shared-scope filter is now forced to enabled in `shared` tab context and the shared-scope toggle is hidden there, preventing accidental exclusion of “shared with me” items from the shared page.

## Overview
- **Source file:** `src/pages/Home/Home.tsx`
- **Last documented:** 2026-04-03
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Participates in navigation/routing behavior.

## Exports
- `default Home`

## Main Dependencies
- `react`
- `lucide-react`
- `react-router-dom`
- `./hooks/useHomeLogic`
- `../../hooks/useFolders`
- `./hooks/useHomePageState`
- `./hooks/useHomePageHandlers`
- `../../components/layout/Header`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
- **2026-03-06:** Updated `BinView` integration to pass `layoutMode` in addition to `cardScale`, so trash section follows the same grid/list contracts as the other Home tabs.