<!-- copilot/explanations/codebase/tests/unit/App.authListener.test.md -->

# App.authListener.test.jsx

## Overview
- Source file: `tests/unit/App.authListener.test.jsx`
- Last documented: 2026-04-02
- Role: Verifies auth-listener fallback behavior when `users/{uid}` realtime profile read fails.

## Changelog
### 2026-04-02
- Updated `permissionUtils` mock exports to include role-context helpers introduced by App shell active-role hydration (`getActiveRole`, `getAssignedRoles`).
- Preserved existing test intent: session remains usable with auth-derived user data when profile listener errors.
- Added route-level guard test proving `/admin-dashboard` is denied when dual-role account active context is switched to `teacher`.
- Stabilized test determinism by mocking `getDoc`/`setDoc` and clearing localStorage between tests.

## Validation
- `npm run test -- tests/unit/App.authListener.test.jsx` passed in focused Phase 07 validation runs (including active-role route-gate scenario).
