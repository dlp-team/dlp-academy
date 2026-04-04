<!-- copilot/explanations/temporal/lossless-reports/2026-04-04/phase-05-transfer-apply-callable-and-modal.md -->
# Lossless Report - Phase 05 Transfer Apply Callable + Modal Wiring

## Requested Scope
- Continue with next phase step after dry-run wiring by implementing transfer/promote apply/write orchestration that consumes dry-run payload + rollback metadata.

## Implemented Scope
- Added backend callable `applyTransferPromotionPlan` with tenant-safe permission checks.
- Implemented batched write orchestration for:
  - planned course creation,
  - planned class creation,
  - student course-link updates,
  - optional class membership carryover,
  - rollback metadata persistence,
  - idempotent run-state persistence.
- Added frontend service/hook integration for apply callable execution.
- Extended transfer modal with `Aplicar cambios planificados` action and inline apply feedback.
- Added deterministic tests for apply callable handler and expanded service/UI callback coverage.

## Preserved Behaviors
- Existing dry-run callable behavior and preview UI remain intact.
- Existing organization tab actions (CSV linking, create course/class, delete/bin flows) remain intact.
- Existing users/access-code workflows remain unchanged.

## Touched Files
- `functions/security/transferPromotionApplyHandler.js` (new)
- `functions/index.js`
- `src/services/transferPromotionService.ts`
- `src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts`
- `src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx`
- `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx`
- `tests/unit/functions/transfer-promotion-apply-handler.test.js` (new)
- `tests/unit/services/transferPromotionService.test.js`
- `tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx`
- `copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md`
- `copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md`
- `copilot/explanations/codebase/functions/index.md`
- `copilot/explanations/codebase/functions/security/transferPromotionApplyHandler.md` (new)
- `copilot/explanations/codebase/src/services/transferPromotionService.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.md`
- `copilot/explanations/codebase/tests/unit/functions/transfer-promotion-apply-handler.test.md` (new)
- `copilot/explanations/codebase/tests/unit/services/transferPromotionService.test.md`
- `copilot/explanations/codebase/tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.md`

## File-by-File Verification Notes
- Apply callable rejects non-admin roles and cross-tenant institution-admin execution.
- Apply callable validates dry-run payload contract and rollback/request id consistency.
- Apply callable stores idempotent run state and returns `alreadyApplied` on replays.
- Frontend modal now supports dry-run then apply within one controlled flow.
- Hook refreshes courses/classes data after apply completion to keep UI consistent.

## Validation Summary
- `get_errors` clean for all touched source and test files.
- Targeted tests passed:
  - `npm run test -- tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/functions/transfer-promotion-apply-handler.test.js tests/unit/services/transferPromotionService.test.js tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.jsx`

## Residual Follow-Up
- Add explicit rollback execution callable/path to reverse a persisted transfer run from `transferPromotionRollbacks` metadata.
- Add end-to-end validation around class/course eligibility and membership changes across academic-year transfer runs.
