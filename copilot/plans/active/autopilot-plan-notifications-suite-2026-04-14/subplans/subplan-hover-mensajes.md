<!-- copilot/plans/active/autopilot-plan-notifications-suite-2026-04-14/subplans/subplan-hover-mensajes.md -->
# Subplan: Hover Mensajes

## Target Outcomes
- Hovering header messages icon shows latest up to 3 unread message previews.
- Bell dropdown click sends user to notifications page first.
- Notifications page click opens configured hyperlink target.

## Implementation Areas
- [src/components/layout/Header.tsx](src/components/layout/Header.tsx)
- [src/components/ui/NotificationsPanel.tsx](src/components/ui/NotificationsPanel.tsx)
- [src/pages/Notifications/Notifications.tsx](src/pages/Notifications/Notifications.tsx)

## Risks
- Hover panel flicker and accidental dismissal.
- Routing ambiguity between direct_message and other notification types.

## Status
- Pending.
