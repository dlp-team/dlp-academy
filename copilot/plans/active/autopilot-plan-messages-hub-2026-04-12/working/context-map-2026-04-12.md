<!-- copilot/plans/active/autopilot-plan-messages-hub-2026-04-12/working/context-map-2026-04-12.md -->
# Context Map (Working)

## Existing Messaging/Notification Surfaces
- [src/services/directMessageService.ts](../../../../../src/services/directMessageService.ts)
- [src/components/layout/Header.tsx](../../../../../src/components/layout/Header.tsx)
- [src/components/ui/NotificationsPanel.tsx](../../../../../src/components/ui/NotificationsPanel.tsx)
- [src/components/ui/NotificationItemCard.tsx](../../../../../src/components/ui/NotificationItemCard.tsx)
- [src/components/ui/notificationPresentation.tsx](../../../../../src/components/ui/notificationPresentation.tsx)
- [src/pages/Notifications/Notifications.tsx](../../../../../src/pages/Notifications/Notifications.tsx)
- [src/pages/Subject/Subject.tsx](../../../../../src/pages/Subject/Subject.tsx)
- [src/pages/Subject/components/SubjectHeader.tsx](../../../../../src/pages/Subject/components/SubjectHeader.tsx)
- [src/hooks/useNotifications.tsx](../../../../../src/hooks/useNotifications.tsx)

## Candidate New Surfaces
- `src/pages/Messages/**` (new messages workspace)
- `src/hooks/useDirectMessages.ts` (conversation/thread state)
- `src/components/ui/MessageNotificationItem.tsx` or extension of shared item component

## Security Surfaces
- [firestore.rules](../../../../../firestore.rules)
- [src/utils/permissionUtils.js](../../../../../src/utils/permissionUtils.js)
