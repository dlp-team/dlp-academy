<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-05-block-b-users-tab-delete-guardrails.md -->
# Lossless Report - Phase 05 Block B (Users Tab Delete Guardrails)

## 1. Requested Scope
- Continue active plan execution.
- Implement Phase 05 Block B: safe users-tab delete-user capability with tenant and role guardrails.
- Add deterministic tests for authorized and blocked delete paths.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No Firestore rules or Cloud Functions changes.
- No invite-access deletion behavior changes.
- No changes to profile media fallback and past-class rendering from Block A.
- No cross-tenant broadening in user queries.

## 3. Touched Files
- [src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx](src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx)
- [src/pages/InstitutionAdminDashboard/hooks/useUsers.ts](src/pages/InstitutionAdminDashboard/hooks/useUsers.ts)
- [src/pages/InstitutionAdminDashboard/utils/userDeletionGuard.ts](src/pages/InstitutionAdminDashboard/utils/userDeletionGuard.ts)
- [src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx](src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx)
- [tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx](tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx)
- [tests/unit/pages/institution-admin/userDeletionGuard.test.js](tests/unit/pages/institution-admin/userDeletionGuard.test.js)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/README.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/README.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/phases/phase-05-user-management-profile-media-and-past-classes.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/phases/phase-05-user-management-profile-media-and-past-classes.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/phase-05-users-profile-history-kickoff.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/phase-05-users-profile-history-kickoff.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/user-updates.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/user-updates.md)
- [copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/UsersTabContent.md](copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/UsersTabContent.md)
- [copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useUsers.md](copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/hooks/useUsers.md)
- [copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.md](copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.md)
- [copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/utils/userDeletionGuard.md](copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/utils/userDeletionGuard.md)
- [copilot/explanations/codebase/tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.md](copilot/explanations/codebase/tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.md)
- [copilot/explanations/codebase/tests/unit/pages/institution-admin/userDeletionGuard.test.md](copilot/explanations/codebase/tests/unit/pages/institution-admin/userDeletionGuard.test.md)

## 4. Per-File Verification
- [src/pages/InstitutionAdminDashboard/utils/userDeletionGuard.ts](src/pages/InstitutionAdminDashboard/utils/userDeletionGuard.ts)
  - Added centralized guard-code map and evaluator for tenant/role/self/protected-role/active-class checks.
- [src/pages/InstitutionAdminDashboard/hooks/useUsers.ts](src/pages/InstitutionAdminDashboard/hooks/useUsers.ts)
  - Added `handleDeleteUser` with document lookup, guard evaluation, active-class precheck, and local-state sync after delete.
- [src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx](src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx)
  - Added delete buttons per user row, modal-first confirmation, and inline success/error status messages.
  - Added guard-code-specific Spanish feedback mapping for blocked flows.
- [src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx](src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx)
  - Wired `users.handleDeleteUser` into users tab.
- [tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx](tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx)
  - Covers explicit confirm requirement, no row-navigation leakage, success message, and blocked student delete message.
- [tests/unit/pages/institution-admin/userDeletionGuard.test.js](tests/unit/pages/institution-admin/userDeletionGuard.test.js)
  - Covers allowed + blocked guard-code decision matrix.

## 5. Risks and Checks
- Risk: accidental cross-tenant deletion.
  - Check: guard evaluator enforces `institutionId` match before delete.
- Risk: deleting users with active classes.
  - Check: hook preloads class docs and blocks delete with explicit teacher/student guard codes.
- Risk: ambiguous destructive UX.
  - Check: modal-first confirmation and inline Spanish feedback for success/error outcomes.

## 6. Validation Summary
- Diagnostics:
  - `get_errors` clean for touched source and test files.
- Targeted regression tests:
  - `npm run test -- tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx tests/unit/pages/institution-admin/userDeletionGuard.test.js` -> PASS.
- Static gates:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.


