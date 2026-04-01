# AdminDashboard.jsx

## Overview
- **Source file:** `src/pages/AdminDashboard/AdminDashboard.jsx`
- **Last documented:** 2026-03-30
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `default AdminDashboard`

## Main Dependencies
- `react`
- `react-router-dom`
- `../../firebase/config`
- `../../components/layout/Header`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
### 2026-04-01
- Extracted `RoleBadge` and `AdminConfirmModal` from `AdminDashboard.tsx` into dedicated components under `src/pages/AdminDashboard/components/`.
- Preserved existing dialog contracts and role-label rendering behavior by keeping prop and display logic intact.
- Added focused component tests:
	- `tests/unit/pages/admin/RoleBadge.test.jsx`
	- `tests/unit/pages/admin/AdminConfirmModal.test.jsx`
- Re-validated existing integration coverage:
	- `tests/unit/pages/admin/AdminDashboard.confirmDialogs.test.jsx`.
- Extracted `parseCsvEmails` into `src/pages/AdminDashboard/utils/adminEmailUtils.ts` and added focused utility tests in `tests/unit/pages/admin/adminEmailUtils.test.js`.
- Extracted users table row UI/actions into `UserTableRow.tsx` and `UserStatusBadge.tsx`, reducing inline table-row complexity in `AdminDashboard.tsx`.
- Added focused row interaction coverage in `tests/unit/pages/admin/UserTableRow.test.jsx` and re-validated confirm-dialog integration tests.
- Extracted institutions table row UI/actions into `InstitutionTableRow.tsx`, moving row-level action buttons and status display out of `AdminDashboard.tsx`.
- Added focused institutions row interaction coverage in `tests/unit/pages/admin/InstitutionTableRow.test.jsx` and re-validated existing integration tests.
- Extracted users-table filtering logic to `src/pages/AdminDashboard/utils/adminUserFilterUtils.ts` and added focused utility tests in `tests/unit/pages/admin/adminUserFilterUtils.test.js`.
- Extracted institutions-table filtering logic to `src/pages/AdminDashboard/utils/adminInstitutionFilterUtils.ts` and added focused utility tests in `tests/unit/pages/admin/adminInstitutionFilterUtils.test.js`.
- Extracted users pagination query-building logic to `src/pages/AdminDashboard/utils/adminUserPaginationQueryUtils.ts` and added focused query-shape tests in `tests/unit/pages/admin/adminUserPaginationQueryUtils.test.js`.
- Extracted users/institutions confirmation modal copy derivation to `src/pages/AdminDashboard/utils/adminConfirmDialogTextUtils.ts` and added focused copy coverage in `tests/unit/pages/admin/adminConfirmDialogTextUtils.test.js`.
- Extracted users role constants and display mappers to `src/pages/AdminDashboard/utils/adminUserRoleConstants.ts`, replacing inline role filter labels and confirm-copy role-label map usage.
- Extracted users filter controls to `src/pages/AdminDashboard/components/AdminUsersFilters.tsx`, replacing inline users-tab role/search/status controls with componentized callback wiring.
- Extracted institutions filter controls and create-toggle trigger to `src/pages/AdminDashboard/components/AdminInstitutionsFilters.tsx`, replacing inline institutions-tab filter/search/button controls with componentized callback wiring.

### 2026-03-30
- Replaced browser `window.confirm(...)` dialogs in Admin institutions/users tabs with a shared in-page confirmation modal (`AdminConfirmModal`).
- Institution destructive actions now execute only after explicit modal confirmation:
	- enable/disable institution,
	- delete institution.
- User destructive actions now execute only after explicit modal confirmation:
	- enable/disable user,
	- role change.
- Added focused regression coverage in `tests/unit/pages/admin/AdminDashboard.confirmDialogs.test.jsx`.
- Hardened `UsersTab` pagination fetch lifecycle by refactoring `fetchUsers` to `useCallback` with explicit cursor input, removing stale effect dependency warnings while preserving existing pagination behavior.
- Added focused pagination regression coverage that verifies load-more queries use `startAfter(lastVisible)` and append next-page users.
