<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-04-post-course-policy-visibility.md -->
# Lossless Report - Phase 04 Post-Course Policy Visibility

## Requested Scope
- Continue Phase 04 by applying post-extraordinary visibility behavior according to `postCoursePolicy`.
- Persist policy snapshots with subject metadata and enforce policy-aware visibility in Home lifecycle paths.

## Preserved Behaviors
- Existing period selector and period timeline-bound persistence remain unchanged.
- Existing extraordinary-window role matrix behavior (passed students vs failed students, teacher visibility) remains unchanged.
- Legacy subjects without timeline bounds continue to use academic-year fallback behavior.

## Touched Files
- `src/utils/subjectPeriodLifecycleUtils.ts`
- `src/hooks/useHomeState.ts`
- `src/pages/Subject/modals/SubjectFormModal.tsx`
- `src/hooks/useHomeHandlers.ts`
- `src/hooks/useSubjects.ts`
- `src/utils/subjectAccessUtils.ts`
- `tests/unit/utils/subjectPeriodLifecycleUtils.test.js`
- `tests/unit/hooks/useHomeState.academicYearFilter.test.js`
- `tests/unit/utils/subjectAccessUtils.test.js`

## File-by-File Verification
- `subjectPeriodLifecycleUtils.ts`
  - Added `isSubjectVisibleByPostCoursePolicy(...)` for post-extraordinary visibility decisions.
- `useHomeState.ts`
  - Usage/courses grouped content now filters by post-course policy after extraordinary cutoff.
- `SubjectFormModal.tsx`
  - Subject save payload now snapshots normalized `postCoursePolicy` from institution settings.
- `useHomeHandlers.ts`
  - Save/update payload forwarding now includes `postCoursePolicy` when present.
- `useSubjects.ts`
  - `updateSubject(...)` now normalizes `postCoursePolicy` to allowed values.
- `subjectAccessUtils.ts`
  - `normalizeSubjectAccessPayload(...)` now normalizes `postCoursePolicy` with default fallback.
- Tests
  - Added policy-helper coverage in `subjectPeriodLifecycleUtils.test.js`.
  - Added Home usage-mode post-policy visibility tests in `useHomeState.academicYearFilter.test.js`.
  - Added payload normalization assertions for `postCoursePolicy` in `subjectAccessUtils.test.js`.

## Validation Summary
- `get_errors` clean on touched source/test files.
- `npm run test:unit -- tests/unit/utils/subjectPeriodLifecycleUtils.test.js tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/utils/subjectAccessUtils.test.js` passed (24/24).
- `npx tsc --noEmit` passed.
- `npm run lint` passed with pre-existing unrelated warnings in:
  - `src/pages/Content/Exam.jsx`
  - `src/pages/Content/StudyGuide.jsx`
