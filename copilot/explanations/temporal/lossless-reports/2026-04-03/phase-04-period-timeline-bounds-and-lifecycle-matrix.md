<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-04-period-timeline-bounds-and-lifecycle-matrix.md -->
# Lossless Report - Phase 04 Period Timeline Bounds and Lifecycle Matrix

## Requested Scope
- Continue Phase 04 after Home period-filter controls.
- Extend subject period metadata with explicit timeline bounds.
- Wire role-aware lifecycle filtering (ordinary vs extraordinary windows) into Home active/current visibility.

## Preserved Behaviors
- Existing subject period selector UX and persisted period filter behavior remain unchanged.
- Existing academic-year fallback behavior is preserved for legacy subjects without period timeline fields.
- Existing sharing, invite-code, and class-assignment flows remain unchanged.

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
  - Added period timeline derivation (`buildSubjectPeriodTimeline`) and lifecycle visibility matrix (`isSubjectActiveInPeriodLifecycle`).
  - Added safe date-only boundary normalization helper (`normalizePeriodBoundaryDate`).
- `useHomeState.ts`
  - `showOnlyCurrentSubjects` now uses role-aware period lifecycle visibility when timeline bounds are present.
  - Legacy records without timeline bounds still use academic-year fallback.
- `SubjectFormModal.tsx`
  - Added institution calendar preload state for timeline generation.
  - Save normalization now persists `periodStartAt`, `periodEndAt`, and `periodExtraordinaryEndAt`.
- `useHomeHandlers.ts`
  - Subject save/update payload forwarding now includes period timeline boundary fields.
- `useSubjects.ts`
  - `updateSubject(...)` now normalizes period timeline boundary fields to date-only ISO or `null`.
- `subjectAccessUtils.ts`
  - `normalizeSubjectAccessPayload(...)` now normalizes period timeline boundaries for create path payloads.
- Tests
  - Added utility tests for lifecycle matrix and timeline generation.
  - Expanded Home lifecycle tests for extraordinary-window student/teacher behavior.
  - Expanded payload normalization tests for new timeline fields.

## Validation Summary
- `get_errors` clean on all touched source/test files.
- `npm run test:unit -- tests/unit/utils/subjectPeriodLifecycleUtils.test.js tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/utils/subjectAccessUtils.test.js tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx` passed (24/24).
- `npx tsc --noEmit` passed.
- `npm run lint` passed with pre-existing unrelated warnings in:
  - `src/pages/Content/Exam.jsx`
  - `src/pages/Content/StudyGuide.jsx`
