<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-04-backend-lifecycle-field-consumers-home.md -->
# Lossless Report - Phase 04 Backend Lifecycle Field Consumers (Home)

## Requested Scope
- Add targeted consumer behavior for backend lifecycle automation fields in Home lifecycle policy evaluation.

## Preserved Behavior
- Existing date-based lifecycle and post-course policy logic remains as fallback.
- Existing role matrix behavior remains unchanged when backend fields are absent.
- Existing Home grouped/search/filter lifecycle behavior remains intact.

## Implemented Changes
- `src/utils/subjectPeriodLifecycleUtils.ts`
  - `isSubjectActiveInPeriodLifecycle(...)` now first checks `lifecyclePhase` when present:
    - `active` => visible,
    - `extraordinary` => role-aware student pass-state rule,
    - `post_extraordinary` => hidden for current-only lifecycle checks.
  - `isSubjectVisibleByPostCoursePolicy(...)` now first checks `lifecyclePostCourseVisibility` when present:
    - `hidden` => hidden,
    - `teacher_only` => student hidden,
    - `all`/`all_no_join` => visible.
  - Added fallback use of `lifecyclePhase` + `postCoursePolicy` when visibility snapshot is absent.
- `tests/unit/utils/subjectPeriodLifecycleUtils.test.js`
  - Added deterministic coverage for backend snapshot field consumption.
- `tests/unit/hooks/useHomeState.academicYearFilter.test.js`
  - Added usage-mode student coverage for backend snapshot visibility behavior in Home grouped results.

## Documentation Sync
- Updated:
  - `copilot/explanations/codebase/src/utils/subjectPeriodLifecycleUtils.md`
  - `copilot/explanations/codebase/tests/unit/utils/subjectPeriodLifecycleUtils.test.md`
  - `copilot/explanations/codebase/tests/unit/hooks/useHomeState.academicYearFilter.test.md`
  - `copilot/plans/active/.../phases/phase-04-subject-periods-and-lifecycle-automation-planned.md`
  - `copilot/plans/active/.../strategy-roadmap.md`

## Validation Evidence
- `get_errors` on touched files: no errors.
- Targeted tests:
  - `npm run test -- tests/unit/utils/subjectPeriodLifecycleUtils.test.js tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/functions/subjectLifecycleAutomation.test.js`
  - Result: 3 files passed, 21 tests passed.
- Typecheck:
  - `npx tsc --noEmit` passed.
- Lint:
  - `npm run lint` passed with unchanged pre-existing 4 warnings in `src/pages/Content/Exam.jsx` and `src/pages/Content/StudyGuide.jsx`.

## Lossless Conclusion
The change is deterministic and non-breaking: backend lifecycle fields are consumed when available to align UI visibility with automation outputs, while existing date-based policy logic remains as compatibility fallback.
