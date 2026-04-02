<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-05-ended-indicators-active-current-slice-05.md -->

# Lossless Report - Phase 05 Slice 05 (Ended Indicators + Active/Current Controls)

## Requested Scope
1. Complete remaining Phase 05 lifecycle work with role-aware ended-subject indicators.
2. Add active/current visibility controls for Home `courses` and `usage` tabs.
3. Keep existing courses year-range filtering, nested collapsibles, and Home mode flows intact.

## Preserved Behaviors
- Existing Home mode switcher tabs and behavior remain unchanged (`grid`, `usage`, `courses`, `shared`, `bin`).
- Existing courses academic-year range filter and nested year wrappers remain unchanged.
- Existing history-retirement behavior remains unchanged.
- Existing drag/drop, selection mode, and shared/bin flows remain unchanged.

## Touched Files
- `src/utils/academicYearLifecycleUtils.ts`
- `src/hooks/useHomeState.ts`
- `src/pages/Home/hooks/useHomeLogic.ts`
- `src/pages/Home/hooks/useHomeControlsHandlers.ts`
- `src/pages/Home/components/HomeControls.tsx`
- `src/pages/Home/Home.tsx`
- `src/components/modules/SubjectCard/SubjectCard.tsx`
- `src/components/modules/SubjectCard/SubjectCardFront.tsx`
- `src/components/modules/ListItems/SubjectListItem.tsx`
- `tests/unit/hooks/useHomeState.academicYearFilter.test.js`
- `tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx`
- `tests/unit/utils/academicYearLifecycleUtils.test.js`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/README.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/strategy-roadmap.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-05-academic-year-governance-and-courses-ux-overhaul.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/subplans/subplan-04-academic-year-and-courses-lifecycle.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/working/execution-log-2026-04-02.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/reviewing/verification-checklist-2026-04-02.md`
- `copilot/explanations/codebase/src/utils/academicYearLifecycleUtils.md`
- `copilot/explanations/codebase/src/pages/Home/hooks/useHomeState.md`
- `copilot/explanations/codebase/src/pages/Home/hooks/useHomeLogic.md`
- `copilot/explanations/codebase/src/pages/Home/hooks/useHomeControlsHandlers.md`
- `copilot/explanations/codebase/src/pages/Home/components/HomeControls.md`
- `copilot/explanations/codebase/src/pages/Home/Home.md`
- `copilot/explanations/codebase/src/components/modules/SubjectCard/SubjectCard.md`
- `copilot/explanations/codebase/src/components/modules/SubjectCard/SubjectCardFront.md`
- `copilot/explanations/codebase/src/components/modules/ListItems/SubjectListItem.md`
- `copilot/explanations/codebase/tests/unit/hooks/useHomeState.academicYearFilter.test.md`
- `copilot/explanations/codebase/tests/unit/pages/home/HomeControls.activeCurrentToggle.test.md`
- `copilot/explanations/codebase/tests/unit/utils/academicYearLifecycleUtils.test.md`

## Per-File Verification Notes
- `academicYearLifecycleUtils.ts`:
  - Added canonical lifecycle helpers and role-aware badge semantics without changing existing persistence or permission flows.
- `useHomeState.ts`:
  - Added persisted active/current toggle state and lifecycle filtering in `usage`/`courses` (including search branch in those modes).
- `HomeControls.tsx` + `useHomeControlsHandlers.ts` + `useHomeLogic.ts` + `Home.tsx`:
  - Added new `Solo vigentes` control wiring and preference persistence without changing existing controls behavior.
- `SubjectCard*` + `SubjectListItem.tsx`:
  - Added role-aware ended badges while preserving existing passed-shortcut visual precedence.
- Tests:
  - Added deterministic coverage for lifecycle utility behavior, Home controls toggle wiring, and Home state lifecycle filtering.

## Validation Summary
- `get_errors` on touched source/test files -> clean.
- Focused tests:
  - `npm run test -- tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx tests/unit/utils/academicYearLifecycleUtils.test.js tests/unit/pages/home/HomeMainContent.test.jsx` -> PASS (14 tests).
- Typecheck:
  - `npx tsc --noEmit` -> PASS.
- Lint:
  - `npm run lint` -> PASS with 4 pre-existing warnings in unrelated `src/pages/Content/*` files.

## Residual Risks
- No new regressions identified in touched Home lifecycle surfaces.
- Global pending gate remains unchanged: emulator-backed Phase 02 rules validation still requires environment startup configuration.
