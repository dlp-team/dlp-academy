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

### Extracted confirm-dialog copy utility
- New file: `src/pages/AdminDashboard/utils/adminConfirmDialogTextUtils.ts`
- New file: `tests/unit/pages/admin/adminConfirmDialogTextUtils.test.js`
- Moved inline institution/user confirm modal title/description/confirm-label derivation to dedicated utility helpers while preserving text semantics and fallback labels.

### Extracted users role constants and label mappers
- New file: `src/pages/AdminDashboard/utils/adminUserRoleConstants.ts`
- New file: `tests/unit/pages/admin/adminUserRoleConstants.test.js`
- Replaced inline users-tab role filter arrays/labels and role-confirm label map with centralized constants.
- Replaced `UserTableRow` inline role option labels with constants + option-label mapper.

### Extracted users filters component
- New file: `src/pages/AdminDashboard/components/AdminUsersFilters.tsx`
- New file: `tests/unit/pages/admin/AdminUsersFilters.test.jsx`
- Moved users-tab role filter buttons, search field, and status selector UI into a dedicated component while preserving callback wiring and control semantics.

### Extracted institutions filters component
- New file: `src/pages/AdminDashboard/components/AdminInstitutionsFilters.tsx`
- New file: `tests/unit/pages/admin/AdminInstitutionsFilters.test.jsx`
- Moved institutions-tab status/type filters, search field, and create-form toggle trigger UI into a dedicated component while preserving callback wiring and control semantics.

### Extracted institution form panel component
- New file: `src/pages/AdminDashboard/components/InstitutionFormPanel.tsx`
- New file: `tests/unit/pages/admin/InstitutionFormPanel.test.jsx`
- Moved institutions create/edit form panel markup and field/update wiring into a dedicated component while preserving submit/close and field-normalization behavior.

### Extracted institution form-state utility
- New file: `src/pages/AdminDashboard/utils/adminInstitutionFormUtils.ts`
- New file: `tests/unit/pages/admin/adminInstitutionFormUtils.test.js`
- Moved repeated institutions form default/reset/edit mapping logic into a dedicated utility while preserving initial values, admin-email fallback, and timezone defaults.

### Extracted institution invite-sync utility
- New file: `src/pages/AdminDashboard/utils/adminInstitutionInviteSyncUtils.ts`
- New file: `tests/unit/pages/admin/adminInstitutionInviteSyncUtils.test.js`
- Moved inline invite-diff computation in institutions edit flow into a dedicated utility while preserving invite add/delete semantics.

### Extracted institution payload utility
- New file: `src/pages/AdminDashboard/utils/adminInstitutionPayloadUtils.ts`
- New file: `tests/unit/pages/admin/adminInstitutionPayloadUtils.test.js`
- Moved institutions submit input normalization and payload construction into a dedicated utility while preserving trimming, timezone fallback, and payload-shape semantics.

### Extracted institution submit validation utility
- New file: `src/pages/AdminDashboard/utils/adminInstitutionValidationUtils.ts`
- New file: `tests/unit/pages/admin/adminInstitutionValidationUtils.test.js`
- Moved institutions submit validation checks/messages into a dedicated utility while preserving existing validation wording and behavior.

### Extracted institution submit batch-queue utility
- New file: `src/pages/AdminDashboard/utils/adminInstitutionBatchQueueUtils.ts`
- New file: `tests/unit/pages/admin/adminInstitutionBatchQueueUtils.test.js`
- Moved institutions create/edit Firestore batch queue orchestration into dedicated utility helpers while preserving existing invite-sync and code-write semantics.

### Extracted institution invite-query utility
- New file: `src/pages/AdminDashboard/utils/adminInstitutionInviteQueryUtils.ts`
- New file: `tests/unit/pages/admin/adminInstitutionInviteQueryUtils.test.js`
- Moved institutions edit-flow invite query/loading logic into a dedicated utility while preserving query filters and invite mapping semantics.

### Extracted users confirm-action utility
- New file: `src/pages/AdminDashboard/utils/adminUserConfirmActionUtils.ts`
- New file: `tests/unit/pages/admin/adminUserConfirmActionUtils.test.js`
- Moved users confirm action update-payload derivation into a dedicated utility while preserving toggle and role-change semantics.

## Validation
- `get_errors`: clean in touched files.
- `npm run test -- tests/unit/pages/admin/AdminConfirmModal.test.jsx tests/unit/pages/admin/RoleBadge.test.jsx tests/unit/pages/admin/adminEmailUtils.test.js tests/unit/pages/admin/UserTableRow.test.jsx tests/unit/pages/admin/InstitutionTableRow.test.jsx tests/unit/pages/admin/adminUserFilterUtils.test.js tests/unit/pages/admin/adminInstitutionFilterUtils.test.js tests/unit/pages/admin/adminUserPaginationQueryUtils.test.js tests/unit/pages/admin/adminConfirmDialogTextUtils.test.js tests/unit/pages/admin/adminUserRoleConstants.test.js tests/unit/pages/admin/AdminUsersFilters.test.jsx tests/unit/pages/admin/AdminInstitutionsFilters.test.jsx tests/unit/pages/admin/InstitutionFormPanel.test.jsx tests/unit/pages/admin/adminInstitutionFormUtils.test.js tests/unit/pages/admin/adminInstitutionInviteSyncUtils.test.js tests/unit/pages/admin/adminInstitutionPayloadUtils.test.js tests/unit/pages/admin/adminInstitutionValidationUtils.test.js tests/unit/pages/admin/adminInstitutionBatchQueueUtils.test.js tests/unit/pages/admin/adminInstitutionInviteQueryUtils.test.js tests/unit/pages/admin/adminUserConfirmActionUtils.test.js tests/unit/pages/admin/AdminDashboard.confirmDialogs.test.jsx`: 21/21 files passing, 50/50 tests passing.
- `npm run lint`: 0 errors, 4 pre-existing warnings in unrelated files.

## Next Slices
- Evaluate extraction of users pagination response-state update logic into dedicated utility.
