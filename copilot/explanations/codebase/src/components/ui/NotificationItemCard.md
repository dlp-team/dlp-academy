<!-- copilot/explanations/codebase/src/components/ui/NotificationItemCard.md -->
# NotificationItemCard.tsx

## Overview
- Source file: `src/components/ui/NotificationItemCard.tsx`
- Last documented: 2026-04-12
- Role: Shared notification-row renderer for panel and history views.

## Responsibilities
- Renders consistent notification title/message/time and unread marker UI.
- Renders notification-specific visual metadata via `notificationPresentation` helpers.
- Renders sharer/sender avatar metadata for `subject_shared` and `direct_message` events.
- Preserves pending shortcut move request actions (`Aprobar`, `Rechazar`).

## Main Dependencies
- `react`
- `lucide-react`
- `src/components/ui/Avatar.tsx`
- `src/components/ui/notificationPresentation.tsx`

## Exports
- `default NotificationItemCard`

## Changelog
- 2026-04-12: Added to centralize notification row rendering across `NotificationsPanel` and notifications history page.
