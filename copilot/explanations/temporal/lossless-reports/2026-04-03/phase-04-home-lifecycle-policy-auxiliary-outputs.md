<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-04-home-lifecycle-policy-auxiliary-outputs.md -->
# Lossless Report - Phase 04 Home Lifecycle Policy Auxiliary Outputs

## Requested Scope
- Extend lifecycle/post-course policy visibility beyond Home grouped `usage`/`courses` paths where required by product behavior.

## Preserved Behavior
- Existing grouped content lifecycle and period filtering behavior was preserved.
- Existing student/teacher role matrix behavior remained unchanged.
- Grid, shared, and non-lifecycle Home modes were preserved (no lifecycle policy filtering introduced there).

## Implemented Changes
- `src/hooks/useHomeState.ts`
  - Added shared lifecycle policy filter helper for `usage`/`courses` mode.
  - Reused that helper in grouped query and non-query branches (no behavior drift expected).
  - Extended lifecycle/post-course policy filtering to:
    - `searchSubjects`,
    - `filteredSubjects` hook output.
- `tests/unit/hooks/useHomeState.academicYearFilter.test.js`
  - Added deterministic assertions that policy filtering is enforced in `searchSubjects` and `filteredSubjects` for usage mode student flows after extraordinary cutoff.

## Documentation Sync
- Updated:
  - `copilot/explanations/codebase/src/pages/Home/hooks/useHomeState.md`
  - `copilot/explanations/codebase/tests/unit/hooks/useHomeState.academicYearFilter.test.md`
  - `copilot/plans/active/.../phases/phase-04-subject-periods-and-lifecycle-automation-planned.md`
  - `copilot/plans/active/.../strategy-roadmap.md`

## Validation Evidence
- `get_errors` on touched files: no errors.
- Targeted tests:
  - `npm run test -- tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/utils/subjectPeriodLifecycleUtils.test.js tests/unit/functions/subjectLifecycleAutomation.test.js`
  - Result: 3 files passed, 19 tests passed.
- Typecheck:
  - `npx tsc --noEmit` passed.
- Lint:
  - `npm run lint` passed with unchanged pre-existing 4 warnings in `src/pages/Content/Exam.jsx` and `src/pages/Content/StudyGuide.jsx`.

## Lossless Conclusion
The change is additive and scoped: lifecycle policy visibility now consistently propagates to auxiliary Home subject outputs in lifecycle-aware modes while preserving non-lifecycle and existing grouped behavior.
