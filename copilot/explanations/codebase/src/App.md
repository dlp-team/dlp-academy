# App.tsx

## [2026-04-12] Dedicated Messages Route

### Change
- Added protected route `/messages` mapped to `src/pages/Messages/Messages.tsx`.
- Kept route under standard `ProtectedRoute` user/auth gating to preserve existing access model.

### Impact
- Direct-message workflows now have a dedicated workspace separated from generic notifications history.
- Header message entrypoint can safely deep-link to a focused conversation hub without overloading notification panel behavior.

## [2026-04-08] Public Theme Preview Route

### Change
- Added public route `/theme-preview` mapped to `src/pages/ThemePreview/ThemePreview.tsx`.
- Kept route outside `ProtectedRoute` so iframe preview no longer depends on authenticated Home route/session state.

### Impact
- Institution customization preview can now render through a local mock route with no secondary auth account behavior.
- Theme-preview iframe becomes deterministic and isolated from Home route authorization constraints.

## [2026-04-07] Institution Live Preview Message Listener

### Change
- Added app-level `message` listener for institution customization live-preview payloads (`dlp-preview-theme-update`).
- Runtime listener now injects preview theme/highlight style tags and optional highlight hint text inside iframe app context.
- Added preview-role handoff in iframe context by dispatching active-role change events (`teacher` / `student`) for mock account preview behavior.

### Impact
- Institution admin color edits now preview on real Home UI in iframe without persisting changes.
- Highlight instructions and affected region emphasis now render inside iframe runtime context.

## [2026-04-07] Global Theme Consistency Enforcement

### Change
- Added app-level theme synchronization effect in `src/App.tsx` that applies the user-selected theme (`light`/`dark`/`system`) across all routes.
- Added a system-theme media-query listener that reapplies `system` mode when OS theme preference changes.

### Impact
- Theme mode now stays consistent outside Settings page surfaces.
- `system` theme preference no longer drifts between pages after navigation.

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
