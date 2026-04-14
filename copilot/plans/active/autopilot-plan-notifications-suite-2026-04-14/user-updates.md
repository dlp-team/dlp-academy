<!-- copilot/plans/active/autopilot-plan-notifications-suite-2026-04-14/user-updates.md -->
# User Updates

## How to Use
- Add new requirements under Pending User Updates.
- Move completed requirements to Processed Updates with date and changed files.

## Pending User Updates
- None.

## Processed Updates
- 2026-04-14: Implemented notification taxonomy + icon contract updates in [src/components/ui/notificationPresentation.tsx](src/components/ui/notificationPresentation.tsx).
- 2026-04-14: Added student visible-content notifications (task/test/material) with route metadata in [src/hooks/useNotifications.tsx](src/hooks/useNotifications.tsx).
- 2026-04-14: Added new-content notifications toggle wiring in [src/pages/Settings/components/NotificationSection.tsx](src/pages/Settings/components/NotificationSection.tsx) and [src/pages/Settings/hooks/useSettingsPageState.ts](src/pages/Settings/hooks/useSettingsPageState.ts).
- 2026-04-14: Preserved deterministic 24h due-soon assignment notification flow in [src/hooks/useNotifications.tsx](src/hooks/useNotifications.tsx).
- 2026-04-14: Added message hover preview (max 3 unread) in [src/components/layout/Header.tsx](src/components/layout/Header.tsx).
- 2026-04-14: Updated bell dropdown flow to notifications page-first in [src/components/ui/NotificationsPanel.tsx](src/components/ui/NotificationsPanel.tsx) and hyperlink-follow behavior in [src/pages/Notifications/Notifications.tsx](src/pages/Notifications/Notifications.tsx).
- 2026-04-14: Removed duplicate plain formula line when KaTeX reference rendering is present in [src/pages/Messages/Messages.tsx](src/pages/Messages/Messages.tsx).
