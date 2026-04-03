<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-03-class-year-lock-and-subject-courseid-persistence.md -->
# Lossless Report - Phase 03 Class-Year Lock and Subject CourseId Persistence

## Requested Scope
- Continue roadmap execution after checkpoint commit/push.
- Harden Phase 03 requirements around class academic-year linkage and same-year subject class assignment behavior.

## Preserved Behaviors
- Existing Institution Admin course/class CRUD flows remain unchanged in UX and permissions.
- Subject save validations (`name`, `course`) and sharing/classes-tab permissions remain unchanged.
- Existing invite code and class assignment workflows remain intact.

## Touched Files
- `src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts`
- `src/pages/Subject/modals/SubjectFormModal.tsx`
- `src/pages/Subject/modals/subject-form/BasicInfoFields.tsx`
- `src/hooks/useHomeHandlers.ts`
- `src/hooks/useSubjects.ts`
- `src/utils/subjectAccessUtils.ts`
- `tests/unit/utils/subjectAccessUtils.test.js`

## File-by-File Verification
- `useClassesCourses.ts`
  - Added `resolveCourseAcademicYear(...)` helper.
  - Class create/update now reconcile `academicYear` from linked course when course link exists.
  - Fallback normalization retained for legacy/no-course paths.
- `SubjectFormModal.tsx`
  - Added selected-course resolution (`courseId` + name fallback) and derived subject year from selected course when `initialData.academicYear` is absent.
  - Normalized save payloads for general/classes tabs to persist `course`, `courseId`, and `academicYear` consistently.
- `BasicInfoFields.tsx`
  - Course selector now uses `course.id` as option value.
  - Keeps backward-compatible display for unavailable legacy course names.
- `useHomeHandlers.ts`
  - Subject payload now forwards `courseId` and `academicYear` when present.
- `useSubjects.ts`
  - Update path now normalizes optional `courseId`/`academicYear` (`trim` -> `null` when empty).
- `subjectAccessUtils.ts`
  - Create/normalize path now includes normalized optional `courseId`/`academicYear`.
- `subjectAccessUtils.test.js`
  - Added deterministic tests for `courseId`/`academicYear` normalization and null coercion.

## Validation Summary
- `get_errors` clean on all touched source/test files.
- `npx vitest run tests/unit/utils/subjectAccessUtils.test.js` passed (11/11).
- `npx tsc --noEmit` passed.
- `npm run lint` passed with pre-existing unrelated warnings in:
  - `src/pages/Content/Exam.jsx`
  - `src/pages/Content/StudyGuide.jsx`
