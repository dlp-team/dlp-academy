<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/phase-06-optimization-kickoff.md -->
# Phase 06 Working Note - Cross-Cutting Optimization and Consolidation

## Status
- IN_PROGRESS

## Block Tracking
- Block A (2026-04-05): COMPLETED
- Block B (2026-04-05): COMPLETED
- Block C (2026-04-05): COMPLETED
- Block D (next): PLANNED

## Block A Scope (Completed)
- Consolidate duplicated users-tab delete feedback logic into shared utility.
- Keep users-tab runtime behavior unchanged while reducing inline branching.
- Add deterministic tests for shared message mapping.

## Block A Delivery
- Added shared feedback utility:
  - [src/pages/InstitutionAdminDashboard/utils/userDeletionFeedback.ts](src/pages/InstitutionAdminDashboard/utils/userDeletionFeedback.ts)
- Updated users-tab consumer to use shared feedback utility:
  - [src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx](src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx)
- Added deterministic utility tests:
  - [tests/unit/pages/institution-admin/userDeletionFeedback.test.js](tests/unit/pages/institution-admin/userDeletionFeedback.test.js)

## Block A Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx tests/unit/pages/institution-admin/userDeletionGuard.test.js tests/unit/pages/institution-admin/userDeletionFeedback.test.js` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Upcoming Block B Scope
- Continue low-risk consolidation in Institution Admin user-management surfaces.
- Preserve behavior while reducing repeated state/formatting patterns.

## Block B Delivery
- Consolidated repeated delete-action button markup into shared local renderer in:
  - [src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx](src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx)
- Consolidated repeated user-delete confirm reset into a single state factory in:
  - [src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx](src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx)
- Consolidated repeated post-delete local-list filtering callback in:
  - [src/pages/InstitutionAdminDashboard/hooks/useUsers.ts](src/pages/InstitutionAdminDashboard/hooks/useUsers.ts)

## Block B Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx tests/unit/pages/institution-admin/userDeletionGuard.test.js tests/unit/pages/institution-admin/userDeletionFeedback.test.js` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Upcoming Block C Scope
- Continue low-risk consolidation in Institution Admin user-management surfaces.
- Keep existing delete-user behavior and tests unchanged while reducing duplication where safe.

## Block C Delivery
- Consolidated repeated access-delete closed-state factory in:
  - [src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx](src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx)
- Consolidated repeated teachers/students tab switch handlers in:
  - [src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx](src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx)
- Consolidated repeated load-more button rendering in:
  - [src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx](src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx)

## Block C Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx tests/unit/pages/institution-admin/userDeletionGuard.test.js tests/unit/pages/institution-admin/userDeletionFeedback.test.js` (PASS)
- `npm run lint` (PASS)
- `npx tsc --noEmit` (PASS)

## Upcoming Block D Scope
- Continue low-risk consolidation in Institution Admin user-management surfaces.
- Keep behavior stable and preserve all existing users-tab regression contracts.
