# App.jsx

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
- **Source file:** `src/App.jsx`
- **Last documented:** 2026-03-29
- **Role:** Root app shell that wires auth state, user bootstrap, route protection, and page routing.
