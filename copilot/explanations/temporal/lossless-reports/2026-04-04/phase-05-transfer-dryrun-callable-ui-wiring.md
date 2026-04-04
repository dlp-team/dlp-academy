<!-- copilot/explanations/temporal/lossless-reports/2026-04-04/phase-05-transfer-dryrun-callable-ui-wiring.md -->
# Lossless Report - Phase 05 Transfer Dry-Run Callable + UI Wiring

## Requested Scope
- Continue Phase 05 by wiring transfer/promote dry-run utilities into callable execution path and institution-admin UI trigger.

## Implemented Scope
- Added backend callable handler `runTransferPromotionDryRun` with institution-scoped permission checks and deterministic preview mappings.
- Added backend shared transfer-plan utilities for payload validation and rollback metadata composition.
- Added frontend service wrapper + `useClassesCourses` execution API to invoke callable and normalize fallback rollback metadata.
- Added new institution-admin modal (`Simulación de traslado/promoción`) and toolbar trigger in courses tab.
- Added deterministic tests for callable handler, service wrapper, and UI trigger delegation.

## Preserved Behaviors
- Existing courses/classes CRUD, trash lifecycle, and CSV linking flows remain unchanged.
- Access-code rotation and user import flows remain unchanged.
- No write/apply migration mutations were introduced in this block (dry-run preview only).

## Touched Files
- `functions/security/transferPromotionPlanUtils.js` (new)
- `functions/security/transferPromotionDryRunHandler.js` (new)
- `functions/index.js`
- `src/services/transferPromotionService.ts` (new)
- `src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts`
- `src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx` (new)
- `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx`
- `tests/unit/functions/transfer-promotion-dry-run-handler.test.js` (new)
- `tests/unit/services/transferPromotionService.test.js` (new)
- `tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx` (new)
- `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md`
- `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md`
- `copilot/explanations/codebase/functions/index.md`
- `copilot/explanations/codebase/functions/security/transferPromotionPlanUtils.md` (new)
- `copilot/explanations/codebase/functions/security/transferPromotionDryRunHandler.md` (new)
- `copilot/explanations/codebase/src/services/transferPromotionService.md` (new)
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.md` (new)
- `copilot/explanations/codebase/tests/unit/functions/transfer-promotion-dry-run-handler.test.md` (new)
- `copilot/explanations/codebase/tests/unit/services/transferPromotionService.test.md` (new)
- `copilot/explanations/codebase/tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.md` (new)

## File-by-File Verification Notes
- Backend callable validates tenant permissions (`admin` or own `institutionadmin`) and rejects cross-tenant execution.
- Preview mapping logic is deterministic for course/class planned IDs and supports existing-target reuse.
- Student assignment preview respects mode (`promote` vs `transfer`) and optional class-membership simulation.
- Frontend modal keeps Spanish-visible text and uses inline feedback (no alert).
- Existing organization toolbar actions (CSV link + create course/class) preserved.

## Validation Summary
- `get_errors` clean for all touched source/test files.
- Targeted tests passed:
  - `npm run test -- tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/services/transferPromotionService.test.js tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.jsx`

## Residual Follow-Up
- Implement transfer/promote apply/write execution path using dry-run payload + rollback metadata.
- Add broader end-to-end coverage for student/class assignment transitions across academic years.
