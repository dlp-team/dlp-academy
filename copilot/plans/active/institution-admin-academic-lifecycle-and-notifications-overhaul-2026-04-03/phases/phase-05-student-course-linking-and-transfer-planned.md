<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md -->
# Phase 05 - Student-Course Linking and Transfer Flows (IN_PROGRESS)

## Objective
Implement safe pathways to link students to courses (CSV/manual), constrain class assignment by course, and support next-year transfer/promotion flows.

## Planned Changes
- Student-course linking via CSV import wizard and manual assignment path.
- Class assignment picker constrained to students in selected course.
- Course hierarchy configuration (common presets + custom order).
- Next-academic-year course duplication/transfer tooling with visibility controls.

## Progress Update (2026-04-03)
- Implemented first Phase 05 slice: class student pickers now resolve eligible students by selected course in both create and edit experiences.
- Added shared helper `studentCourseLinkUtils.ts` to centralize eligibility resolution from profile links and existing class memberships.
- Added compatibility fallback when student-course links are not yet populated so legacy institutions keep operability while migration progresses.
- Extended deterministic tests for modal behavior and utility filtering matrix.
- Added ClassDetail regression tests to verify out-of-course options are blocked for new assignments while preserving selected/legacy visibility and fallback behavior.
- Hardened class course-change flow: when a class switches course, student assignments are normalized to the new course eligibility set (with legacy fallback preservation).

## Progress Update (2026-04-04)
- Consolidated exam content surface to TypeScript-only source by removing duplicate `src/pages/Content/Exam.jsx` and keeping `src/pages/Content/Exam.tsx` as canonical implementation.
- Preserved lifecycle subject-access gate behavior on direct exam routes and added explicit regression coverage for denied access redirects.
- Updated exam unit suite to mock `canUserAccessSubject(...)` deterministically and verify redirect to `/home` when a student loses lifecycle visibility.

## Validation Evidence
- `npm run test:unit -- tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx tests/unit/pages/institution-admin/studentCourseLinkUtils.test.js`
- `npm run test:unit -- tests/unit/pages/institution-admin/ClassDetail.studentCourseEligibility.test.jsx tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx tests/unit/pages/institution-admin/studentCourseLinkUtils.test.js`
- `npm run test:unit -- tests/unit/pages/content/Exam.test.jsx`
- `get_errors` clean for all touched source and test files in this slice.

## Remaining in Phase 05
- Add manual/CSV linking interfaces in institution-admin user management flows.
- Define and implement transfer/promote orchestration with dry-run and rollback metadata.
- Add end-to-end validation for cross-course assignment constraints after linking rollout.

## Risks and Controls
- Risk: orphaned student mappings after transfer.
  - Control: idempotent transfer operation and rollback metadata.
- Risk: accidental student access carryover.
  - Control: explicit visibility defaults and enrollment mode review.

## Exit Criteria
- Admin can link students at scale and manually.
- Transfer flow creates predictable next-year courses without exposing them prematurely.
