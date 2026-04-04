<!-- copilot/explanations/temporal/lossless-reports/2026-04-04/phase-05-transfer-rollback-path-and-intake-sync.md -->
# Lossless Report - Phase 05 Transfer Rollback Path + Intake Sync

## Requested Scope
- Continue with the active plan and execute the next pending transfer/promotion milestone.

## Implemented Scope
- Processed pending intake updates before coding:
  - enforced clickable Markdown file-link guidance in instruction docs,
  - extended create-plan governance with mandatory two-step inReview gate,
  - added shared out-of-scope risk log file and synchronized active plan docs.
- Implemented explicit rollback execution callable path for transfer/promotion flows:
  - new backend callable `rollbackTransferPromotionPlan`,
  - apply callable now persists rollback execution snapshots needed for deterministic reversal,
  - frontend service/hook/modal rollback wiring (`Ejecutar rollback`).
- Added deterministic tests for rollback handler and expanded service/UI transfer tests.

## Preserved Behaviors
- Existing dry-run/apply transfer functionality remains intact.
- Existing organization CRUD/bin/CSV workflows remain unchanged.
- Existing role/institution permission guardrails remain enforced.

## Touched Files
- `.github/copilot-instructions.md`
- `AGENTS.md`
- `.github/skills/create-plan/SKILL.md`
- `copilot/plans/out-of-scope-risk-log.md` (new)
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/README.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md`
- `copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/user-updates.md`
- `functions/security/transferPromotionApplyHandler.js`
- `functions/security/transferPromotionRollbackHandler.js` (new)
- `functions/index.js`
- `src/services/transferPromotionService.ts`
- `src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts`
- `src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx`
- `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx`
- `tests/unit/functions/transfer-promotion-apply-handler.test.js`
- `tests/unit/functions/transfer-promotion-rollback-handler.test.js` (new)
- `tests/unit/services/transferPromotionService.test.js`
- `tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx`
- `copilot/explanations/codebase/functions/index.md`
- `copilot/explanations/codebase/functions/security/transferPromotionApplyHandler.md`
- `copilot/explanations/codebase/functions/security/transferPromotionRollbackHandler.md` (new)
- `copilot/explanations/codebase/src/services/transferPromotionService.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.md`
- `copilot/explanations/codebase/tests/unit/functions/transfer-promotion-apply-handler.test.md`
- `copilot/explanations/codebase/tests/unit/functions/transfer-promotion-rollback-handler.test.md` (new)
- `copilot/explanations/codebase/tests/unit/services/transferPromotionService.test.md`
- `copilot/explanations/codebase/tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.md`

## File-by-File Verification Notes
- `transferPromotionApplyHandler.js`
  - now stores `executionSnapshot` in rollback metadata (created ids + pre-apply snapshots).
- `transferPromotionRollbackHandler.js`
  - enforces tenant-safe rollback execution and idempotent `alreadyRolledBack` behavior.
  - restores snapshots and deletes created transfer artifacts.
- `TransferPromotionDryRunModal.tsx`
  - includes rollback action with inline status feedback and execution guards.

## Validation Summary
- `get_errors` clean for touched source and test files.
- Targeted tests passed:
  - `npm run test -- tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/functions/transfer-promotion-apply-handler.test.js tests/unit/functions/transfer-promotion-rollback-handler.test.js tests/unit/services/transferPromotionService.test.js tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.jsx`

## Residual Follow-Up
- Add end-to-end validation for class/course eligibility outcomes across full transfer + rollback cycles.
- Execute inReview two-step governance for Phase 05 (optimization first, then deep risk analysis with out-of-scope logging).
