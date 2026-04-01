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

## Validation
- `get_errors`: clean in touched files.
- `npm run test -- tests/unit/pages/admin/AdminConfirmModal.test.jsx tests/unit/pages/admin/RoleBadge.test.jsx tests/unit/pages/admin/adminEmailUtils.test.js tests/unit/pages/admin/UserTableRow.test.jsx tests/unit/pages/admin/AdminDashboard.confirmDialogs.test.jsx`: 5/5 files passing, 13/13 tests passing.
- `npm run lint`: 0 errors, 4 pre-existing warnings in unrelated files.

## Next Slices
- Extract institutions-table row actions into a focused component.
- Evaluate extraction of query-building helpers for pagination and filters.
