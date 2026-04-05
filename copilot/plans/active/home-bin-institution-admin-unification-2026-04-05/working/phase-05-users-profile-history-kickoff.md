<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/phase-05-users-profile-history-kickoff.md -->
# Phase 05 Working Note - Users, Profile Media, and Past Classes

## Status
- COMPLETED

## Block Tracking
- Block A (2026-04-05): COMPLETED
- Block B (2026-04-05): COMPLETED

## Block A Scope (Completed)
- Harden user-detail profile media reliability with safe fallback rendering.
- Remove emoji-based role badge labels and switch to icon-based rendering.
- Introduce dedicated `Clases pasadas` section sourced from archived class rows.
- Add deterministic regression coverage for new behavior.

## Block A Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Upcoming Block B Scope
- Add safe delete-user capability in Users tab with explicit guardrails.
- Enforce tenant-safe behavior for destructive user operations.
- Add deterministic tests for authorized/blocked deletion flows.

## Block B Delivery (Completed)
- Added guard-code evaluator and protected-role/self/cross-tenant checks in:
	- [src/pages/InstitutionAdminDashboard/utils/userDeletionGuard.ts](src/pages/InstitutionAdminDashboard/utils/userDeletionGuard.ts)
- Added users-hook delete action with active-class prechecks in:
	- [src/pages/InstitutionAdminDashboard/hooks/useUsers.ts](src/pages/InstitutionAdminDashboard/hooks/useUsers.ts)
- Added users-tab delete controls, confirmation modal, and inline Spanish feedback in:
	- [src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx](src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx)
	- [src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx](src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx)
- Added deterministic tests:
	- [tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx](tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx)
	- [tests/unit/pages/institution-admin/userDeletionGuard.test.js](tests/unit/pages/institution-admin/userDeletionGuard.test.js)

## Block B Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx tests/unit/pages/institution-admin/userDeletionGuard.test.js` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Transition Note
- Phase 05 deliverables are complete and ready for Phase 06 kickoff.
