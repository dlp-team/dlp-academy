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

## Validation
- `npm run test -- tests/unit/App.authListener.test.jsx` passed in focused Phase 07 validation run.
