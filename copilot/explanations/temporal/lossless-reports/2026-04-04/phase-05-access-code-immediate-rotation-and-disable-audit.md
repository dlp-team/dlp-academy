<!-- copilot/explanations/temporal/lossless-reports/2026-04-04/phase-05-access-code-immediate-rotation-and-disable-audit.md -->
# Lossless Report - Phase 05 Access Code Immediate Rotation and Disable Audit

## Requested Scope
- Ensure teacher and student institutional codes in users tab can be changed immediately.
- Preserve/confirm disable capability for both role code policies.
- Audit and choose safe implementation that avoids interval-hack side effects.

## Audit Decision
- Selected **versioned code rotation** over interval manipulation.
- Rationale:
  - Keeps existing interval windows intact.
  - Invalidates current code immediately by incrementing a role policy `codeVersion` seed.
  - Avoids race and schedule drift that would occur by forcing temporary 1-second intervals.

## Preserved Behaviors
- Existing `requireCode` toggle remains source of truth for enabling/disabling role codes.
- Existing policy save flow and access policy UI remain intact.
- Existing role/institution authorization checks for code preview remain enforced.

## Touched Files
- `functions/index.js`
- `functions/security/previewHandler.js`
- `functions/security/rotateCodeHandler.js` (new)
- `src/services/accessCodeService.ts`
- `src/pages/InstitutionAdminDashboard/hooks/useUsers.ts`
- `src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx`
- `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx`
- `tests/unit/functions/rotate-code-handler.test.js` (new)
- `tests/unit/functions/preview-handler.test.js`
- `tests/unit/services/accessCodeService.test.js`
- `tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx`
- `tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx`
- `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md`
- `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md`
- `copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/user-updates.md`
- `copilot/explanations/codebase/functions/index.md`
- `copilot/explanations/codebase/functions/security/previewHandler.md` (new)
- `copilot/explanations/codebase/functions/security/rotateCodeHandler.md` (new)
- `copilot/explanations/codebase/src/services/accessCodeService.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useUsers.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/UsersTabContent.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.md`
- `copilot/explanations/codebase/tests/unit/functions/rotate-code-handler.test.md` (new)
- `copilot/explanations/codebase/tests/unit/services/accessCodeService.test.md` (new)

## File-by-File Verification Notes
- Backend
  - Added `rotateInstitutionalAccessCodeNow` callable with tenant-safe permission checks.
  - Added `codeVersion` to dynamic seed in shared server code generator.
  - Kept `validateInstitutionalAccessCode` role-policy evaluation and added version-awareness.
  - Extended preview handler to accept `codeVersion` for immediate UI consistency.
- Frontend
  - Added service wrapper for immediate rotation callable.
  - Added users-hook handler (`handleRotateLiveCode`) with inline success/error feedback and policy synchronization.
  - Added users-tab `Regenerar ahora` button in security panel for both teachers and students.
- Tests
  - Added backend unit tests for rotate handler authorization and version increment behavior.
  - Extended service tests for new callable and preview payload.
  - Added UI regression assertion for `Regenerar ahora` callback delegation.

## Validation Summary
- `get_errors` clean on all touched source and test files.
- Targeted tests passed:
  - `npm run test -- tests/unit/functions/preview-handler.test.js tests/unit/functions/rotate-code-handler.test.js tests/unit/services/accessCodeService.test.js tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx`
  - Result: 5 files passed, 19 tests passed.

## Residual Follow-Up
- Remaining pending intake item: direct Google Sheets ingestion and richer n8n AI response mapping/reporting for CSV workflows.
