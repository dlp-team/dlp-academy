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
- Added manual student-course linking controls to Institution Admin student detail view with institution-scoped Firestore updates (`courseId`, `courseIds`, `enrolledCourseIds`).
- Added inline add/remove feedback and deterministic regression tests for manual link mutations.
- Added CSV bulk-linking workflow in Users tab (students view) with in-page modal, summary reporting, and hook-level Firestore writes that append profile course links per student.
- Split CSV workflows by domain intent: users tab now exposes `Vincular alumnos por CSV` while courses tab now exposes `Vincular cursos por CSV`.
- Added shared storage-backed workflow modal (`CSV/Excel/TXT`) with two execution modes: manual in-app mapping and n8n webhook dispatch.
- Extended users hook with institution-scoped import upload handler, manual student enrichment import (identifier/name/course optional), and manual course-link import (email or identifier + course).
- Added deterministic regression coverage for new users-tab callback delegation and new courses-tab CSV action.
- Implemented immediate institutional access-code regeneration using role policy `codeVersion` increments, without changing configured rotation intervals.
- Added backend callable `rotateInstitutionalAccessCodeNow` plus UI `Regenerar ahora` action for both teacher and student policy views.
- Preserved disable behavior through existing `requireCode` policy toggle and blocked immediate rotation when codes are disabled.
- Added direct Google Sheets source support in CSV workflows by converting shared sheet URLs into CSV export endpoints for manual imports.
- Extended n8n flow payload/summary with source metadata and richer AI reporting fields (`warnings`, `recommendations`, `detectedColumns`, `aiMapping`).
- Defined transfer/promote dry-run contract utilities with deterministic payload builder, payload validator, and rollback metadata snapshot builder.
- Added dedicated utility tests to lock the new contract before wiring migration writes.
- Synced plan-governance intake updates: `create-plan` skill now requires a final optimization phase and strict `Pending -> Processed` user-update transition before coding each block.
- Wired transfer/promote dry-run backend callable `runTransferPromotionDryRun` with strict tenant permission checks and deterministic mapping previews for courses, classes, and student assignments.
- Added dry-run trigger modal in Institution Admin courses tab (`Simular traslado/promoción`) with mode/options selection and summary visualization.
- Integrated `useClassesCourses` dry-run execution path to validate payloads, call backend preview, and normalize rollback metadata for UI consumption.
- Added deterministic unit coverage for callable handler, frontend service wrapper, and organization-tab dry-run trigger wiring.
- Implemented apply callable `applyTransferPromotionPlan` to execute batched course/class/student updates from dry-run mappings with institution-scoped permission checks.
- Added rollback/run persistence (`transferPromotionRollbacks`, `transferPromotionRuns`) with idempotent re-apply short-circuit by `requestId`.
- Extended transfer modal flow with `Aplicar cambios planificados` action wired to hook/service apply API and inline apply feedback.
- Added deterministic apply-handler unit tests and expanded service/UI wiring tests for apply callable delegation.

## Validation Evidence
- `npm run test:unit -- tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx tests/unit/pages/institution-admin/studentCourseLinkUtils.test.js`
- `npm run test:unit -- tests/unit/pages/institution-admin/ClassDetail.studentCourseEligibility.test.jsx tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx tests/unit/pages/institution-admin/studentCourseLinkUtils.test.js`
- `npm run test:unit -- tests/unit/pages/content/Exam.test.jsx`
- `npm run test:unit -- tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx tests/unit/pages/institution-admin/studentCourseLinkUtils.test.js`
- `npm run test:unit -- tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx tests/unit/pages/institution-admin/studentCourseLinkUtils.test.js`
- `npm run test -- tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx`
- `npm run test -- tests/unit/functions/preview-handler.test.js tests/unit/functions/rotate-code-handler.test.js tests/unit/services/accessCodeService.test.js tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx`
- `npm run test -- tests/unit/pages/institution-admin/importSourceUtils.test.js tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.jsx`
- `npm run test -- tests/unit/pages/institution-admin/transferPromotionPlanUtils.test.js`
- `npm run test -- tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/services/transferPromotionService.test.js tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.jsx`
- `npm run test -- tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/functions/transfer-promotion-apply-handler.test.js tests/unit/services/transferPromotionService.test.js tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.jsx`
- `get_errors` clean for all touched source and test files in this slice.

## Remaining in Phase 05
- Implement explicit rollback execution callable/path that consumes persisted rollback metadata to reverse applied transfer writes when needed.
- Add end-to-end validation for cross-course assignment constraints after linking rollout.

## Risks and Controls
- Risk: orphaned student mappings after transfer.
  - Control: idempotent transfer operation and rollback metadata.
- Risk: accidental student access carryover.
  - Control: explicit visibility defaults and enrollment mode review.

## Exit Criteria
- Admin can link students at scale and manually.
- Transfer flow creates predictable next-year courses without exposing them prematurely.
