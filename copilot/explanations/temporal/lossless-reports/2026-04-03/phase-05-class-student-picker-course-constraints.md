<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-05-class-student-picker-course-constraints.md -->
# Lossless Report - Phase 05 Class Student Picker Course Constraints

## Requested Scope
- Continue active plan execution into Phase 05 with a concrete slice: constrain class student assignment to students linked with the selected course.

## Preserved Behaviors
- Existing class/course CRUD flows and deletion semantics remain unchanged.
- Academic-year inheritance and class-name composition remain unchanged.
- Teacher assignment behavior remains unchanged.
- Legacy institutions without student-course links keep operability through compatibility fallback.

## Implemented Changes
- `src/pages/InstitutionAdminDashboard/components/classes-courses/studentCourseLinkUtils.ts`
  - Added shared helpers to resolve student linked courses from profile fields and existing class memberships.
  - Added `resolveEligibleStudentsForCourse(...)` with legacy fallback when no links are present.
- `src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx`
  - Filtered student picker options by selected course eligibility.
  - Added compatibility and empty-result informational copy.
  - Added stale-selection pruning guard on course change.
  - Fixed potential render loop by using stable default `classes` and no-op state-update guard.
- `src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.tsx`
  - Applied course-aware student picker filtering during class edit.
  - Prevented adding new out-of-course students while preserving visibility of preselected legacy rows for cleanup.
  - Added compatibility and out-of-course warning copy.
- `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx`
  - Passed live `classes` data into `CreateClassModal` and `ClassDetail` so eligibility can include class-membership-derived course links.
- `tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx`
  - Added deterministic tests for course-based filtering and legacy fallback copy.
  - Replaced fallback-year assertion with shared helper-driven expectation to keep test stable.
- `tests/unit/pages/institution-admin/studentCourseLinkUtils.test.js`
  - Added new deterministic unit coverage for merged link resolution, eligibility filtering, class-membership inference, and legacy fallback.

## Validation Evidence
- `get_errors`:
  - Clean on all touched source and test files.
- Targeted tests:
  - Command: `npm run test:unit -- tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx tests/unit/pages/institution-admin/studentCourseLinkUtils.test.js`
  - Result: PASS (`2` files, `8` tests).

## Documentation Sync
- Updated active plan docs:
  - `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/README.md`
  - `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md`
  - `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md`
- Updated codebase explanations:
  - `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/modals/CreateClassModal.md`
  - `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.md`
  - `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.md`
  - `copilot/explanations/codebase/tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.md`
- Added codebase explanations:
  - `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/studentCourseLinkUtils.md`
  - `copilot/explanations/codebase/tests/unit/pages/institution-admin/studentCourseLinkUtils.test.md`
- Added temporal note:
  - `copilot/explanations/temporal/institution-admin/phase-05-class-student-picker-course-constraints-2026-04-03.md`

## Lossless Conclusion
This implementation is surgical and scoped to Phase 05 enrollment constraints. It closes the class-assignment integrity gap by enforcing course-aware student eligibility while maintaining backward compatibility for legacy data states and preserving unrelated organization workflows.
