# useNotifications.tsx

## [2026-04-04] Type-Based TTL Retention and Cleanup

### Change
- Added type-based notification retention filtering through [src/utils/notificationRetentionUtils.ts](src/utils/notificationRetentionUtils.ts).
- Snapshot listener now separates active vs expired notifications and performs bounded cleanup deletes for expired notification ids.
- Added in-flight cleanup guard to prevent duplicate delete attempts for the same notification id during rapid snapshot refreshes.

### Impact
- Notification panel/page renders a retention-aware view instead of unbounded historical growth.
- Expired notifications are cleaned up progressively per-user without requiring manual actions.

## [2026-03-29] Snapshot Error Hardening

### Context
- Notifications listener used `onSnapshot` without an error callback.
- Permission-denied events surfaced as uncaught snapshot errors and destabilized runtime behavior.

### Change
- Added explicit `onSnapshot` error callback in `src/hooks/useNotifications.js`.
- On listener failure, logs context and resets local notifications state safely.

### Validation
- `get_errors` returned no issues for `src/hooks/useNotifications.js`.

## [2026-04-02] Active Role Student Notification Gate

### Change
- Student-only assignment notification bootstrap now resolves user role through `getActiveRole(user)`.
- Hook dependency wiring now tracks `activeRole` instead of raw `user.role`.

### Impact
- Notification listeners stay aligned with switched role context in dual-role sessions.

## [2026-04-02] Shortcut Move Request Resolution Actions

### Change
- Added integration with `resolveShortcutMoveRequest` callable through new hook API:
	- `resolveMoveRequestFromNotification(notification, resolution)`.
- Added local resolving-state tracking keyed by request id:
	- `isResolvingMoveRequest(requestId)`.
- Resolution flow now updates the owner notification as read/resolved after callable success.

### Impact
- Header notification panel can trigger approve/reject actions directly from pending move-request notifications.
- Action buttons can reflect in-flight state deterministically while avoiding duplicate submissions.

## Overview
- **Source file:** `src/hooks/useNotifications.tsx`
- **Last documented:** 2026-04-04
- **Role:** Custom hook for real-time notification retrieval and read-state updates.

## Responsibilities
- Subscribe to user notifications in Firestore.
- Maintain unread counter.
- Expose APIs to mark one/all notifications as read.
- Enforce type-based retention filtering and cleanup for expired notifications.

## Exports
- `const useNotifications`
