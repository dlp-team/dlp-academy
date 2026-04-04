<!-- copilot/explanations/codebase/src/utils/notificationRetentionUtils.md -->
# notificationRetentionUtils.ts

## Overview
- Source file: `src/utils/notificationRetentionUtils.ts`
- Last documented: 2026-04-04
- Role: Type-based notification retention policy helper for TTL-style cleanup decisions.

## Responsibilities
- Defines retention-day map by notification type.
- Normalizes and parses notification `createdAt` values from Firestore timestamps/date strings.
- Determines whether a notification is expired for cleanup.

## Exports
- `NOTIFICATION_RETENTION_DAYS_BY_TYPE`
- `getNotificationRetentionDays(type)`
- `getNotificationCreatedAtMs(notification)`
- `isNotificationExpired(notification, nowMs)`
