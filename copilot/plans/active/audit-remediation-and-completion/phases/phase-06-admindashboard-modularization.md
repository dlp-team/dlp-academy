<!-- copilot/plans/active/audit-remediation-and-completion/phases/phase-06-admindashboard-modularization.md -->

# Phase 06: AdminDashboard Modularization

**Duration:** 4-6 hours | **Priority:** 🟡 HIGH | **Status:** 🔄 IN PROGRESS

## Objective
Reduce `AdminDashboard.tsx` complexity by extracting reusable UI primitives from the page coordinator while preserving behavior.

## Slice Completed (2026-04-01)

### Extracted role and confirmation UI primitives
- New file: `src/pages/AdminDashboard/components/RoleBadge.tsx`
- New file: `src/pages/AdminDashboard/components/AdminConfirmModal.tsx`
- Removed inline definitions of `RoleBadge` and `AdminConfirmModal` from `AdminDashboard.tsx`.
- Wired `AdminDashboard.tsx` to imported components without changing prop contracts.

### Added regression tests for extracted components
- New file: `tests/unit/pages/admin/RoleBadge.test.jsx`
- New file: `tests/unit/pages/admin/AdminConfirmModal.test.jsx`
- Re-ran existing dialog integration tests:
  - `tests/unit/pages/admin/AdminDashboard.confirmDialogs.test.jsx`

### Extracted email parsing utility
- New file: `src/pages/AdminDashboard/utils/adminEmailUtils.ts`
- New file: `tests/unit/pages/admin/adminEmailUtils.test.js`
- Moved inline `parseCsvEmails` helper from `AdminDashboard.tsx` to utility module and kept call sites unchanged.

### Extracted users table row components
- New file: `src/pages/AdminDashboard/components/UserStatusBadge.tsx`
- New file: `src/pages/AdminDashboard/components/UserTableRow.tsx`
- New file: `tests/unit/pages/admin/UserTableRow.test.jsx`
- Moved users-row rendering logic from inline table rows to `UserTableRow` component while preserving callbacks:
  - role change flow via `handleRoleChange`
  - enable/disable flow via `handleToggle`

### Extracted institutions table row component
- New file: `src/pages/AdminDashboard/components/InstitutionTableRow.tsx`
- New file: `tests/unit/pages/admin/InstitutionTableRow.test.jsx`
- Moved institutions-row rendering/action markup from `AdminDashboard.tsx` into `InstitutionTableRow` while preserving callbacks:
  - open institution dashboard
  - edit institution
  - enable/disable institution
  - delete institution

### Extracted users filtering utility
- New file: `src/pages/AdminDashboard/utils/adminUserFilterUtils.ts`
- New file: `tests/unit/pages/admin/adminUserFilterUtils.test.js`
- Moved inline users filtering expression in `UsersTab` to `filterAdminUsers(...)` utility while preserving filtering semantics.

### Extracted institutions filtering utility
- New file: `src/pages/AdminDashboard/utils/adminInstitutionFilterUtils.ts`
- New file: `tests/unit/pages/admin/adminInstitutionFilterUtils.test.js`
- Moved inline institutions filtering expression in `InstitutionsTab` to `filterInstitutions(...)` utility while preserving filtering semantics.

### Extracted users pagination query utility
- New file: `src/pages/AdminDashboard/utils/adminUserPaginationQueryUtils.ts`
- New file: `tests/unit/pages/admin/adminUserPaginationQueryUtils.test.js`
- Moved inline users pagination query-building expression in `UsersTab` `fetchUsers(...)` to `buildAdminUsersPageQuery(...)` utility while preserving cursor/page-size query semantics.

## Validation
- `get_errors`: clean in touched files.
- `npm run test -- tests/unit/pages/admin/AdminConfirmModal.test.jsx tests/unit/pages/admin/RoleBadge.test.jsx tests/unit/pages/admin/adminEmailUtils.test.js tests/unit/pages/admin/UserTableRow.test.jsx tests/unit/pages/admin/InstitutionTableRow.test.jsx tests/unit/pages/admin/adminUserFilterUtils.test.js tests/unit/pages/admin/adminInstitutionFilterUtils.test.js tests/unit/pages/admin/adminUserPaginationQueryUtils.test.js tests/unit/pages/admin/AdminDashboard.confirmDialogs.test.jsx`: 9/9 files passing, 20/20 tests passing.
- `npm run lint`: 0 errors, 4 pre-existing warnings in unrelated files.

## Next Slices
- Evaluate extraction of users confirm-dialog copy/label derivation helpers.
