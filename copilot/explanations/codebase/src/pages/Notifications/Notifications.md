<!-- copilot/explanations/codebase/src/pages/Notifications/Notifications.md -->
# Notifications.tsx

## Overview
- Source file: `src/pages/Notifications/Notifications.tsx`
- Last documented: 2026-04-04
- Role: Dedicated notifications history page rendered at `/notifications`.

## Responsibilities
- Renders full notification history with unread counters and bulk mark-as-read action.
- Reuses shortcut move request approve/reject flows from `useNotifications`.
- Deep-links to subject page (`/home/subject/:subjectId`) when notification payload includes `subjectId`.
- Uses shared header shell for consistent navigation and role context behavior.
- Uses shared notification row renderer (`NotificationItemCard`) for consistency with Header panel visual behavior.

## Main Dependencies
- `src/components/layout/Header.tsx`
- `src/hooks/useNotifications.tsx`
- `react-router-dom` navigation
- `lucide-react` icons

## Exports
- `default Notifications`

## Changelog
- 2026-04-14: Updated item navigation precedence to use `notification.route` first, then subject+topic fallback, then subject fallback.
- 2026-04-12: Filtered out `direct_message` notifications from the notifications history page and updated bulk mark-as-read to target only general notifications.
- 2026-04-12: Migrated notification row UI to shared `NotificationItemCard`, preserving mark-read navigation and shortcut move request actions.
