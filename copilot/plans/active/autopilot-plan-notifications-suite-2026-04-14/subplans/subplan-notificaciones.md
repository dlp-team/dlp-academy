<!-- copilot/plans/active/autopilot-plan-notifications-suite-2026-04-14/subplans/subplan-notificaciones.md -->
# Subplan: Notificaciones

## Target Outcomes
- Distinct icon semantics for message vs bell notifications.
- New-topic visible content notifications for students.
- Type-specific topic notification iconography (test/task/material).
- User settings toggle to disable new-content notifications.
- 24h due-soon deliverable notification.

## Implementation Areas
- [src/hooks/useNotifications.tsx](src/hooks/useNotifications.tsx)
- [src/components/ui/notificationPresentation.tsx](src/components/ui/notificationPresentation.tsx)
- [src/components/ui/NotificationsPanel.tsx](src/components/ui/NotificationsPanel.tsx)
- [src/pages/Notifications/Notifications.tsx](src/pages/Notifications/Notifications.tsx)
- [src/pages/Settings/Settings.tsx](src/pages/Settings/Settings.tsx)
- [functions/index.js](functions/index.js)

## Risks
- Duplicate notifications from listener restarts.
- Missing institution scoping in recipient writes.

## Status
- Pending.
