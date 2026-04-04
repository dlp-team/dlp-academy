# App.tsx

## [2026-04-04] Dedicated Notifications Route

### Change
- Registered protected route `/notifications` in `src/App.tsx`.
- Wired new page component `src/pages/Notifications/Notifications.tsx` into the app shell route map.

### Impact
- Notification dropdown can now hand off to a full-history page without overloading header dropdown UX.
- Notification flows now have a dedicated route surface for future e2e and retention validation.

## [2026-03-29] Auth Listener Permission-Denied Guard

### Context
- Runtime logs reported uncaught Firestore snapshot permission-denied errors originating from the app-level user profile listener.

### Change
- Added a pre-listen `getDoc` bootstrap flow in `src/App.jsx`.
- If `users/{uid}` is missing, app attempts a deterministic bootstrap write with default profile fields.
- If `permission-denied` occurs during bootstrap read, app now falls back to auth-only user state and avoids opening a realtime listener that would spam watch errors.
- Added path header comment (`// src/App.jsx`) to match repository convention for touched files.

### Validation
- `get_errors` clean for `src/App.jsx`.
- Focused tests passed: `tests/unit/App.authListener.test.jsx`.

## Overview
- **Source file:** `src/App.tsx`
- **Last documented:** 2026-04-04
- **Role:** Root app shell that wires auth state, user bootstrap, route protection, and page routing.

## [2026-04-02] Active Role Context Rehydration

### Context
- Phase 07 dual-role implementation required route guards to evaluate an explicit active role (not only persisted primary role), with deterministic session rehydration.

### Change
- Added app-level role-context hydration that enriches authenticated user snapshots with:
	- `availableRoles`,
	- `activeRole` (validated and persisted per user in localStorage).
- Added active-role synchronization listeners:
	- in-tab event listener (`dlp-active-role-change`) for shell-level role switching,
	- `storage` listener for cross-tab consistency.
- Updated `ProtectedRoute` denial logging to report active role context.

### Validation
- `get_errors` clean for `src/App.tsx`.
- Focused tests passed: `tests/unit/App.authListener.test.jsx`.

## [2026-04-02] Deterministic Allowed-Role Route Gate

### Context
- Active-role switching required exact route-level enforcement for dashboard surfaces where inherited rank checks were too permissive for switched contexts.

### Change
- Extended `ProtectedRoute` with optional `allowedRoles` whitelist.
- Applied explicit active-role route gates:
	- `/admin-dashboard` -> admin only,
	- `/institution-admin-dashboard/**` -> institution admin + admin,
	- `/teacher-dashboard/**` -> teacher only,
	- `/student-dashboard` -> student only.
- Kept existing `requiredRole` hierarchy checks for non-whitelist routes.

### Validation
- Added route-level dual-role denial coverage in `tests/unit/App.authListener.test.jsx`.
- Focused suite passed with updated role-context scenarios.
