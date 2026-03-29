# useNotifications.js

## [2026-03-29] Snapshot Error Hardening

### Context
- Notifications listener used `onSnapshot` without an error callback.
- Permission-denied events surfaced as uncaught snapshot errors and destabilized runtime behavior.

### Change
- Added explicit `onSnapshot` error callback in `src/hooks/useNotifications.js`.
- On listener failure, logs context and resets local notifications state safely.

### Validation
- `get_errors` returned no issues for `src/hooks/useNotifications.js`.

## Overview
- **Source file:** `src/hooks/useNotifications.js`
- **Last documented:** 2026-03-29
- **Role:** Custom hook for real-time notification retrieval and read-state updates.

## Responsibilities
- Subscribe to user notifications in Firestore.
- Maintain unread counter.
- Expose APIs to mark one/all notifications as read.

## Exports
- `const useNotifications`
