<!-- copilot/explanations/codebase/src/components/ui/NotificationsPanel.md -->
# NotificationsPanel.tsx

## Changelog
### 2026-04-12
- Migrated per-notification row rendering to shared `NotificationItemCard`.
- Removed duplicated icon/time/action rendering logic from panel.
- Preserved unread counts, mark-read behavior, shortcut move request actions, and trigger-boundary outside-click handling.

### 2026-04-04
- Added trigger-boundary aware outside-click handling (`triggerRef`) so bell-trigger clicks do not race against outside-close logic.
- Added `Ver todas` action (`onOpenAll`) to open dedicated notifications history route.
- Corrected subject navigation path to `/home/subject/:subjectId` when notifications include `subjectId`.

### 2026-04-02
- Added explicit owner actions for pending shortcut move requests:
  - `Aprobar`
  - `Rechazar`
- Added `onResolveMoveRequest` and `isResolvingMoveRequest` props.
- Added pending-request visual state and loading spinner handling for action buttons.
- Updated click behavior to avoid forced navigation when notifications do not contain a `subjectId`.
- Replaced root notification container from nested button structure to keyboard-accessible `div[role="button"]` to keep action buttons valid.

## Overview
- **Source file:** `src/components/ui/NotificationsPanel.tsx`
- **Role:** Notification dropdown renderer with read-state and actionable item controls.

## Props
- `notifications`
- `onMarkAsRead`
- `onMarkAllAsRead`
- `onResolveMoveRequest`
- `isResolvingMoveRequest`
- `triggerRef`
- `onOpenAll`
- `onClose`

## Notes
- Shortcut move request actions are only rendered for `type === shortcut_move_request` and `shortcutMoveRequestStatus === pending`.
