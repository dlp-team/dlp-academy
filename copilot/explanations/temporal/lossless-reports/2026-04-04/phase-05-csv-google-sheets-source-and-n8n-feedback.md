<!-- copilot/explanations/temporal/lossless-reports/2026-04-04/phase-05-csv-google-sheets-source-and-n8n-feedback.md -->
# Lossless Report - Phase 05 CSV Google Sheets Source and n8n Feedback

## Requested Scope
- Continue pending CSV follow-up by adding direct Google Sheets ingestion.
- Improve n8n result reporting with richer AI mapping feedback.

## Preserved Behaviors
- Existing file-upload CSV/Excel workflow remains available and unchanged.
- Existing manual mapping logic for student/course linking remains intact.
- Existing users/courses entrypoint split remains intact.

## Touched Files
- `src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.tsx`
- `src/pages/InstitutionAdminDashboard/hooks/useUsers.ts`
- `src/pages/InstitutionAdminDashboard/utils/importSourceUtils.ts` (new)
- `tests/unit/pages/institution-admin/importSourceUtils.test.js` (new)
- `copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md`
- `copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md`
- `copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/user-updates.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useUsers.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/utils/importSourceUtils.md` (new)
- `copilot/explanations/codebase/tests/unit/pages/institution-admin/importSourceUtils.test.md` (new)

## File-by-File Verification Notes
- `CsvImportWorkflowModal.tsx`
  - Added source switcher (Storage file vs Google Sheets URL).
  - Added Google Sheets URL input for manual/n8n flows.
  - Extended summary rendering for AI feedback arrays/objects from n8n responses.
- `useUsers.ts`
  - Added import source resolver for inline CSV and Google Sheets URL fetch.
  - Extended n8n payload to include source metadata and richer response fields.
- `importSourceUtils.ts`
  - Added URL helpers to detect Google Sheets URLs and normalize to CSV export endpoint.
- Tests
  - Added deterministic utility tests for URL detection/conversion paths.

## Validation Summary
- `get_errors` clean on touched source and test files.
- Targeted tests passed:
  - `npm run test -- tests/unit/pages/institution-admin/importSourceUtils.test.js tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.jsx`
  - Result: 3 files passed, 7 tests passed.

## Residual Follow-Up
- No pending intake updates currently listed in `user-updates.md`.
- Phase 05 remaining core items still open: transfer/promote orchestration and end-to-end assignment validation.
