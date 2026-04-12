<!-- copilot/explanations/codebase/src/components/ui/notificationPresentation.md -->
# notificationPresentation.tsx

## Overview
- Source file: `src/components/ui/notificationPresentation.tsx`
- Last documented: 2026-04-12
- Role: Presentation helper module for notification iconography, actor-avatar metadata, and relative-time formatting.

## Responsibilities
- Formats relative timestamp labels for notifications.
- Detects pending shortcut move request state.
- Resolves notification icon/color metadata by notification type.
- Resolves actor-avatar metadata for share and direct-message notification variants.

## Exports
- `formatNotificationRelativeTime`
- `isPendingShortcutMoveRequest`
- `getNotificationAvatarInfo`
- `getNotificationVisual`

## Changelog
- 2026-04-12: Introduced alongside `NotificationItemCard` to remove duplicate notification presentation logic across panel and page views.
