<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-05-class-course-change-student-normalization.md -->
# Lossless Report - Phase 05 Class Course-Change Student Normalization

## Requested Scope
- Continue Phase 05 implementation with the next integrity increment: when a class changes course, ensure enrolled students stay consistent with the new course linkage model.

## Preserved Behaviors
- Existing class identifier editing UI remains unchanged.
- Teacher assignment behavior remains unchanged.
- Legacy institutions with incomplete student-course link data preserve existing student lists through fallback mode.
- Existing course-aware picker behavior remains unchanged.

## Implemented Changes
- `src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.tsx`
  - In `saveField('identifier')`, added eligibility re-resolution against the newly selected course.
  - Added normalization of `studentIds` in the save patch:
    - keep all students in legacy fallback mode,
    - otherwise retain only students eligible for the new course.
- `tests/unit/pages/institution-admin/ClassDetail.studentCourseEligibility.test.jsx`
  - Added deterministic regression test validating that changing class course prunes incompatible students from save payload.
- Documentation sync updates:
  - `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md`
  - `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.md`
  - `copilot/explanations/codebase/tests/unit/pages/institution-admin/ClassDetail.studentCourseEligibility.test.md`
  - `copilot/explanations/temporal/institution-admin/phase-05-class-student-picker-course-constraints-2026-04-03.md`

## Validation Evidence
- `get_errors`:
  - `src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.tsx` -> no errors.
  - `tests/unit/pages/institution-admin/ClassDetail.studentCourseEligibility.test.jsx` -> no errors.
- Targeted tests:
  - Command: `npm run test:unit -- tests/unit/pages/institution-admin/ClassDetail.studentCourseEligibility.test.jsx tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx tests/unit/pages/institution-admin/studentCourseLinkUtils.test.js`
  - Result: PASS (`3` files, `11` tests).

## Lossless Conclusion
This increment closes a remaining consistency gap in Phase 05 by guaranteeing class-course changes cannot retain incompatible enrollments when eligibility data exists, while preserving backward compatibility for legacy institutions.
