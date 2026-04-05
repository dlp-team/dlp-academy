<!-- copilot/plans/inReview/home-bin-institution-admin-unification-2026-04-05/phases/phase-05-user-management-profile-media-and-past-classes.md -->
# Phase 05 - User Management, Profile Media, and Past Classes

## Status
- COMPLETED

## Objective
Strengthen institution-admin user governance and fidelity of user-detail surfaces.

## Deliverables
- Users tab delete-user capability with proper guardrails.
- User-view profile-image loading from Firebase Storage.
- UI iconography cleanup: replace emojis with icons/components.
- Past/previous classes sections for:
  - teacher user view,
  - student user view.

## Security and Data Integrity Constraints
- Enforce role and institution checks before user deletion.
- Protect against accidental cross-tenant user operations.
- Ensure class-history visibility aligns with role permissions.

## Validation Gate
- Tests for authorized and unauthorized user deletion paths.
- Storage avatar fallback behavior checks.
- Regression checks for user view routes and class associations.
- Lint/typecheck pass.

## Exit Criteria
- Institution admins can safely manage users and user views display complete expected profile/history details.

## Kickoff Notes (2026-04-05)
- Phase 04 closed after validated preview parity slices.
- Phase 05 starts with user-detail fidelity hardening before destructive user-management operations.

## Progress Log
- 2026-04-05 - Block A completed
  - Implemented profile-photo reliability fallback in:
    - [src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx](src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx)
  - Replaced emoji role labels with icon-based role badge rendering in:
    - [src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx](src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx)
  - Added dedicated archived-class rendering section (`Clases pasadas`) for teacher and student detail contexts in:
    - [src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx](src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx)
  - Expanded deterministic regression coverage in:
    - [tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx](tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx)
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/UserDetailView.studentCourseLinks.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block B completed
  - Added tenant-safe delete-user handler and active-class safeguards in:
    - [src/pages/InstitutionAdminDashboard/hooks/useUsers.ts](src/pages/InstitutionAdminDashboard/hooks/useUsers.ts)
    - [src/pages/InstitutionAdminDashboard/utils/userDeletionGuard.ts](src/pages/InstitutionAdminDashboard/utils/userDeletionGuard.ts)
  - Wired users-tab delete action with in-page confirmation and guard-aware feedback in:
    - [src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx](src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx)
    - [src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx](src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx)
  - Added deterministic regression coverage for UI and guard-code paths in:
    - [tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx](tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx)
    - [tests/unit/pages/institution-admin/userDeletionGuard.test.js](tests/unit/pages/institution-admin/userDeletionGuard.test.js)
  - Validation evidence:
    - `npm run test -- tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx tests/unit/pages/institution-admin/UsersTabContent.deleteUserGuard.test.jsx tests/unit/pages/institution-admin/userDeletionGuard.test.js` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

## Closure Notes
- Phase 05 deliverables are complete:
  - delete-user capability with guardrails,
  - profile media fallback,
  - iconized role labels,
  - dedicated past-class sections.
- Ready to transition execution focus into Phase 06 optimization/consolidation.

