<!-- copilot/explanations/temporal/lossless-reports/2026-04-04/phase-05-csv-workflow-relocation-and-import-mapping-foundation.md -->
# Lossless Report - Phase 05 CSV Workflow Relocation and Mapping Foundation

## Requested Scope
- Move `Vincular cursos por CSV` action to the courses section.
- Rename student-side users action to `Vincular alumnos por CSV`.
- Add upload-based overlay using Firebase Storage with two options:
  - Manual mapping of columns.
  - n8n webhook dispatch.
- Support student matching by email and optional identifier for course assignment flows.

## Preserved Behaviors
- Existing teacher/student table behavior in users tab remains unchanged.
- Existing invite deletion confirmation flow remains unchanged.
- Existing classes/courses CRUD and delete-confirm flows remain unchanged.
- Existing legacy `handleBulkLinkStudentsCsv` path is preserved via compatibility wrapper.

## Touched Files
- `src/pages/InstitutionAdminDashboard/hooks/useUsers.ts`
- `src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx`
- `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx`
- `src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.tsx` (new)
- `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx`
- `tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx`
- `tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.jsx` (new)
- `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md`
- `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md`
- `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/user-updates.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useUsers.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/UsersTabContent.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.md` (new)
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.md`
- `copilot/explanations/codebase/tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.md`
- `copilot/explanations/codebase/tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.md` (new)

## File-by-File Verification Notes
- `useUsers.ts`
  - Added storage upload helper for institution-scoped import files.
  - Added manual import core with configurable mappings and student matching by email/identifier.
  - Added dedicated wrappers for student enrichment and course-link import modes.
  - Added n8n webhook dispatch handler via env var `VITE_N8N_CSV_IMPORT_WEBHOOK`.
- `UsersTabContent.tsx`
  - Replaced old inline CSV textarea modal with shared reusable workflow modal.
  - Renamed student button copy to `Vincular alumnos por CSV`.
- `ClassesCoursesSection.tsx`
  - Added courses-tab `Vincular cursos por CSV` action.
  - Wired shared workflow modal for course-link imports.
- `CsvImportWorkflowModal.tsx`
  - New reusable modal with file upload, manual mapping fields, mode switch, and summary/error rendering.
- `InstitutionAdminDashboard.tsx`
  - Wired new handlers from `useUsers` to users and courses sections.
- Tests
  - Updated users CSV suite for renamed action and new callback wiring.
  - Added courses CSV action suite.

## Validation Summary
- `get_errors` clean on all touched source/test files.
- Targeted tests passed:
  - `npm run test -- tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.deleteConfirm.test.jsx`
  - Result: 3 files passed, 8 tests passed.

## Residual Follow-Up
- Pending intake retained for direct Google Sheets ingestion and richer n8n AI response mapping/reporting.
- Access-code immediate regeneration/disable audit remains pending as next major block.
