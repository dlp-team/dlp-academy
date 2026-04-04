<!-- copilot/explanations/temporal/lossless-reports/2026-04-04/phase-05-course-period-schedule-wiring.md -->
# Lossless Report - Phase 05 Course Period Schedule Wiring

## Requested Scope
- Continue plan execution and implement roadmap action: wire per-course period schedule fields into course/settings-adjacent flows and propagate them into subject timeline generation.

## Implemented Scope
- Added shared period schedule utility layer:
  - [src/utils/coursePeriodScheduleUtils.ts](src/utils/coursePeriodScheduleUtils.ts)
- Extended organization data hook to hydrate institution period defaults and normalize schedule payloads:
  - [src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts](src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts)
- Added course-period override inputs in course creation modal:
  - [src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx](src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx)
- Wired period config into course modal from organization section:
  - [src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx](src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx)
- Updated subject save timeline builder invocation to pass selected course schedule override:
  - [src/pages/Subject/modals/SubjectFormModal.tsx](src/pages/Subject/modals/SubjectFormModal.tsx)
- Clarified institution settings UI copy about baseline defaults vs course-level overrides:
  - [src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx](src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx)

## Preserved Behaviors
- Existing course/class academic-year validation remains unchanged.
- Existing transfer dry-run/apply/rollback flows remain unchanged.
- Existing subject period fallback behavior still uses institution calendar when no course override exists.

## Touched Files
- [src/utils/coursePeriodScheduleUtils.ts](src/utils/coursePeriodScheduleUtils.ts)
- [src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts](src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts)
- [src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx](src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx)
- [src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx](src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx)
- [src/pages/Subject/modals/SubjectFormModal.tsx](src/pages/Subject/modals/SubjectFormModal.tsx)
- [src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx](src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx)
- [tests/unit/utils/coursePeriodScheduleUtils.test.js](tests/unit/utils/coursePeriodScheduleUtils.test.js)
- [tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx](tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx)
- [tests/unit/pages/subject/SubjectFormModal.coursePeriodSchedule.test.jsx](tests/unit/pages/subject/SubjectFormModal.coursePeriodSchedule.test.jsx)
- [copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md](copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md)
- [copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md](copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md)

## File-by-File Verification Notes
- [src/utils/coursePeriodScheduleUtils.ts](src/utils/coursePeriodScheduleUtils.ts)
  - Implements period mode normalization, deterministic period definitions, overlap validation, and schedule default generation.
- [src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx](src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx)
  - Adds optional per-course schedule override section with per-period date fields and extraordinary boundary.
  - Submits normalized `coursePeriodSchedule` only when override mode is enabled.
- [src/pages/Subject/modals/SubjectFormModal.tsx](src/pages/Subject/modals/SubjectFormModal.tsx)
  - Adds `coursePeriodSchedule` argument to `buildSubjectPeriodTimeline(...)` to prioritize selected course schedule windows.

## Validation Summary
- `get_errors` clean for all touched source + test files.
- Targeted suite passed:
  - `npm run test -- tests/unit/utils/coursePeriodScheduleUtils.test.js tests/unit/utils/subjectPeriodLifecycleUtils.test.js tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx tests/unit/pages/subject/SubjectFormModal.coursePeriodSchedule.test.jsx`

## Residual Follow-Up
- Add browser-level e2e validation for transfer/promotion constraints.
- Execute Phase 05 inReview two-step sequence (optimization then deep risk analysis) and log out-of-scope findings if discovered.
