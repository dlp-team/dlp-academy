<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-10/phases/phase-05-scrollbar-and-current-academic-filter-fix.md -->
# Phase 05 - Scrollbar and Current Academic Filter Fix

## Status
- IN_REVIEW

## Objective
Fix global scrollbar theme responsiveness and correct `Solo Vigentes` filtering rules.

## Scope
- Scrollbar style updates when dark/light mode changes without page refresh.
- Clean neutral scrollbar palette with transparent track behavior.
- `Solo Vigentes` must only include subjects in current academic year, active trimester, and not finalized.

## Risks
- Theme token update path may not notify global CSS selectors.
- Filter logic may be split across tabs/hooks and can drift by view.

## Exit Criteria
- [x] Scrollbar colors update immediately on mode switch.
- [x] Scrollbar track transparency and thumb colors meet style requirement.
- [x] `Solo Vigentes` returns only eligible current subjects.

## Implementation Update (2026-04-10)
- Updated global scrollbar color tokens in `src/index.css` to stable gray RGBA values and removed fixed light/dark gutter backgrounds to preserve transparent track behavior.
- Corrected dark-mode global scrollbar selector coverage so runtime theme switches apply immediately without requiring page refresh.
- Tightened `showOnlyCurrentSubjects` eligibility in `src/hooks/useHomeState.ts` to enforce current academic year records only, while requiring lifecycle-active status and active period-window matching when period metadata is available.
- Follow-up hardening in [src/index.css](../../../../../src/index.css): transparent track-piece enforcement, hidden scrollbar buttons, transparent resizer/corner handling, and active-mode `overflow-y: auto` + `scrollbar-gutter: auto` to remove visible scrollbar box artifacts while leaving thumb visibility intact.

## Validation Evidence (2026-04-10)
- `get_errors` on touched source/test files -> PASS.
- `npm run test -- tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx tests/unit/components/CustomScrollbar.test.jsx` -> PASS (16 tests).
- `npm run test:unit -- tests/unit/components/FolderListItem.collapseSpacing.test.jsx tests/unit/components/ListViewItem.selectionDimming.test.jsx tests/unit/components/CustomScrollbar.test.jsx tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/hooks/useHomeBulkSelection.test.js` -> PASS (23 tests).

## Follow-up Intake (2026-04-11)
- New user request references the current active plan and asks for a new AUTOPILOT source conveyance with explicit scrollbar follow-up execution.
- Synced intake sources [AUTOPILOT_PLAN.md](../../../../../AUTOPILOT_PLAN.md) and [SCROLLBAR_FIX.md](../../../../../SCROLLBAR_FIX.md) into subplan tracking: [subplans/scrollbar-global-follow-up-2026-04-11.md](../subplans/scrollbar-global-follow-up-2026-04-11.md).
- Phase 05 moved from `IN_REVIEW` back to `IN_PROGRESS` to run cross-route scrollbar harmonization and validation.

## Implementation Update (2026-04-11)
- Added a global `.custom-scrollbar` style contract in [src/index.css](../../../../../src/index.css) so scrollbar thumb/track visuals use shared theme variables and update on dark/light mode changes without local hardcoded drift.
- Removed duplicated local `.custom-scrollbar` WebKit overrides from:
	- [src/pages/Content/Exam.tsx](../../../../../src/pages/Content/Exam.tsx)
	- [src/pages/Content/Formula.tsx](../../../../../src/pages/Content/Formula.tsx)
	- [src/pages/Content/StudyGuide.tsx](../../../../../src/pages/Content/StudyGuide.tsx)

## Validation Evidence (2026-04-11)
- `get_errors` on touched files -> PASS (existing baseline CSS language warnings for `@theme`/`@variant` remain unchanged).
- `npm run test:unit -- tests/unit/components/CustomScrollbar.test.jsx` -> PASS (1/1).
- `npm run test:unit -- tests/unit/pages/content/Exam.test.jsx tests/unit/pages/content/StudyGuide.fallback.test.jsx tests/unit/pages/content/StudyGuide.navigation.test.jsx` -> PASS (8/8).
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> FAIL due pre-existing unrelated typing issue in [src/hooks/useGhostDrag.ts](../../../../../src/hooks/useGhostDrag.ts#L80).

## Validation Reconciliation (2026-04-11)
- After the unrelated blocker in [src/hooks/useGhostDrag.ts](../../../../../src/hooks/useGhostDrag.ts) was fixed during Phase 06, global type-check validation now passes (`npx tsc --noEmit` -> PASS).
