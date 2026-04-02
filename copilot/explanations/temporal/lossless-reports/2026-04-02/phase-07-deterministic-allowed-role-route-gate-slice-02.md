<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-07-deterministic-allowed-role-route-gate-slice-02.md -->

# Lossless Report - Phase 07 Slice 02 (Deterministic Allowed-Role Route Gate)

## Requested Scope
Continue Phase 07 after active-role shell baseline by hardening route-level behavior so switched active context deterministically controls dashboard-route eligibility.

## Preserved Behaviors
- Existing auth bootstrap and permission-denied fallback behavior remains unchanged.
- Existing role hierarchy checks remain available through `requiredRole` semantics.
- Existing non-dashboard routes continue using legacy route guard behavior unless explicitly whitelisted.
- Single-role users preserve previous dashboard navigation behavior.

## Touched Files
- `src/App.tsx`
- `tests/unit/App.authListener.test.jsx`

## Per-File Verification
- `src/App.tsx`
  - Added optional `allowedRoles` to `ProtectedRoute`.
  - Added active-role whitelist gate before rank-based role check.
  - Applied explicit allowed-role constraints to dashboard routes:
    - admin: `admin`
    - institution admin routes: `institutionadmin`, `admin`
    - teacher routes: `teacher`
    - student: `student`
- `tests/unit/App.authListener.test.jsx`
  - Added regression test asserting `/admin-dashboard` denial for dual-role account when active role is `teacher`.
  - Mocked `getDoc`/`setDoc` and cleared localStorage in `beforeEach` for deterministic role hydration.

## Validation Summary
- `get_errors` clean for touched files.
- `npm run test -- tests/unit/utils/permissionUtils.test.js tests/unit/App.authListener.test.jsx`: passed (17 tests).
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with 4 pre-existing warnings in unrelated `src/pages/Content/*`.

## Residual Risk / Next Slice
- Additional role-aware surfaces outside dashboard routes still use raw `user.role` in some modules; these need selective alignment where switched active context should alter UX behavior.
