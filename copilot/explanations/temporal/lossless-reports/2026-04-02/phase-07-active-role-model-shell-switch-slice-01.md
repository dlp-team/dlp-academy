<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-07-active-role-model-shell-switch-slice-01.md -->

# Lossless Report - Phase 07 Slice 01 (Active Role Model Baseline)

## Requested Scope
Implement the first Phase 07 slice for dual-role operation:
1. Add canonical active-role/assigned-role model helpers.
2. Add role switch control in authenticated shell.
3. Persist + rehydrate selected active role safely.
4. Align route/dashboard guard behavior with switched context.

## Preserved Behaviors
- Single-role users continue to work with legacy `role` field only.
- Existing role hierarchy semantics (`admin >= institutionadmin >= teacher >= student`) remain unchanged.
- Existing auth bootstrap fallback behavior in `App` remains unchanged (still tolerates `users/{uid}` listener failure).
- Existing header profile/theme/notification behavior remains intact.
- Existing unrelated workspace deletion (`phase07-lint-current.json`) remains untouched and unstaged.

## Touched Files
- `src/utils/permissionUtils.ts`
- `src/App.tsx`
- `src/components/layout/Header.tsx`
- `src/pages/AdminDashboard/AdminDashboard.tsx`
- `src/pages/TeacherDashboard/TeacherDashboard.tsx`
- `src/pages/StudentDashboard/StudentDashboard.tsx`
- `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx`
- `tests/unit/utils/permissionUtils.test.js`
- `tests/unit/App.authListener.test.jsx`

## Per-File Verification
- `src/utils/permissionUtils.ts`
  - Added `getAssignedRoles(...)` + `getActiveRole(...)`.
  - Switched `hasRequiredRoleAccess(...)` to evaluate active-role context.
  - Kept `getNormalizedRole(...)` backward compatible.
- `src/App.tsx`
  - Added active-role enrichment (`availableRoles`, `activeRole`) during user hydration.
  - Added per-user localStorage persistence/rehydration for active role.
  - Added in-tab and cross-tab synchronization listeners for active-role updates.
  - Protected route warning now reports active role.
- `src/components/layout/Header.tsx`
  - Added role switch `<select>` visible for multi-role users.
  - Dashboard route/label now derive from active role.
  - Emits app-level active-role change event.
- `src/pages/AdminDashboard/AdminDashboard.tsx`
  - Guard now checks `getActiveRole(user) === 'admin'`.
- `src/pages/TeacherDashboard/TeacherDashboard.tsx`
  - Guard now checks `getActiveRole(user) === 'teacher'`.
- `src/pages/StudentDashboard/StudentDashboard.tsx`
  - Added file-path header comment.
  - Guard now checks `getActiveRole(user) === 'student'`.
- `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx`
  - Effective institution override now depends on active admin role.
  - Existing hierarchical guard remains intact.
- `tests/unit/utils/permissionUtils.test.js`
  - Added dual-role resolution and active-role guard coverage.
- `tests/unit/App.authListener.test.jsx`
  - Updated mocked `permissionUtils` exports for new App imports.

## Validation Summary
- `get_errors` on touched files: clean.
- `npm run test -- tests/unit/utils/permissionUtils.test.js tests/unit/App.authListener.test.jsx`: passed (16 tests).
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with 4 pre-existing warnings in unrelated `src/pages/Content/*` files.

## Residual Risk / Next Slice
- Phase 07 remains in progress; additional route/action surfaces that still read raw `user.role` outside dashboard guards should be reviewed and aligned in next slice.
