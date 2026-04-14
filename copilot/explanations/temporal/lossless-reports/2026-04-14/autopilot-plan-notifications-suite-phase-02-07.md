<!-- copilot/explanations/temporal/lossless-reports/2026-04-14/autopilot-plan-notifications-suite-phase-02-07.md -->
# Lossless Report - AUTOPILOT Notifications Suite (Phases 02-07)

## Requested Scope
- Apply notification taxonomy and icon contract updates.
- Generate student notifications for visible topic content (task, test, material).
- Add settings toggle to disable new-content notifications.
- Keep 24h due-soon assignment alert behavior.
- Add header hover preview for unread direct messages (max 3).
- Change bell dropdown flow so dropdown item opens notifications page first.
- Keep hyperlink navigation from notifications page item click.
- Remove duplicate plain-text formula line when formula reference is already rendered in KaTeX.

## Preserved Behaviors
- Existing notification read/mark-all APIs remain intact.
- Existing shortcut move request approve/reject actions remain intact.
- Existing `assignment_due_soon` 24h reminder path remains active.
- Existing direct message send/read behavior remains active.
- Existing multi-tenant recipient filtering remains scoped by enrolled subjects and user institution context.

## Touched Files
- [src/hooks/useNotifications.tsx](src/hooks/useNotifications.tsx)
- [src/components/ui/notificationPresentation.tsx](src/components/ui/notificationPresentation.tsx)
- [src/components/ui/NotificationsPanel.tsx](src/components/ui/NotificationsPanel.tsx)
- [src/pages/Notifications/Notifications.tsx](src/pages/Notifications/Notifications.tsx)
- [src/components/layout/Header.tsx](src/components/layout/Header.tsx)
- [src/pages/Messages/Messages.tsx](src/pages/Messages/Messages.tsx)
- [src/pages/Settings/components/NotificationSection.tsx](src/pages/Settings/components/NotificationSection.tsx)
- [src/pages/Settings/hooks/useSettingsPageState.ts](src/pages/Settings/hooks/useSettingsPageState.ts)
- [tests/unit/components/NotificationsPanel.test.jsx](tests/unit/components/NotificationsPanel.test.jsx)
- [tests/unit/hooks/useSettingsPageState.test.js](tests/unit/hooks/useSettingsPageState.test.js)

## Per-File Verification
- [src/hooks/useNotifications.tsx](src/hooks/useNotifications.tsx)
  - Added subject-chunk listeners for `topicAssignments`, `quizzes`, `documents`, and `resumen`.
  - Added new-content opt-out gate via `settings.notifications.newContent` / `notifications.newContent`.
  - Preserved due-soon 24h assignment notifications and submission delivery guard.
  - Added route metadata for notification deep-link handling.
- [src/components/ui/notificationPresentation.tsx](src/components/ui/notificationPresentation.tsx)
  - Added dedicated icon mappings for task (`assignment_new`) and test (`topic_quiz_new`).
  - Preserved direct-message icon mapping.
- [src/components/ui/NotificationsPanel.tsx](src/components/ui/NotificationsPanel.tsx)
  - Item click now marks read and opens notifications history flow (`onOpenAll`).
  - Removed direct subject navigation from dropdown item click.
- [src/pages/Notifications/Notifications.tsx](src/pages/Notifications/Notifications.tsx)
  - Item click now resolves route precedence: explicit `route` -> subject/topic -> subject.
- [src/components/layout/Header.tsx](src/components/layout/Header.tsx)
  - Added hover/focus unread direct-message preview panel (max 3 items).
  - Preserved messages shortcut navigation and unread badge behavior.
  - Updated panel `onOpenAll` callback to pass selected notification context.
- [src/pages/Messages/Messages.tsx](src/pages/Messages/Messages.tsx)
  - Added formula-line dedup so plain `Formula/Fórmula seleccionada` line is removed when same formula is already rendered via KaTeX context card.
- [src/pages/Settings/components/NotificationSection.tsx](src/pages/Settings/components/NotificationSection.tsx)
  - Added UI toggle for `notifications.newContent`.
- [src/pages/Settings/hooks/useSettingsPageState.ts](src/pages/Settings/hooks/useSettingsPageState.ts)
  - Added `notifications.newContent` default state.
- [tests/unit/components/NotificationsPanel.test.jsx](tests/unit/components/NotificationsPanel.test.jsx)
  - Updated behavior expectation: item click opens full-history callback instead of direct navigation.
- [tests/unit/hooks/useSettingsPageState.test.js](tests/unit/hooks/useSettingsPageState.test.js)
  - Added coverage assertion for `notifications.newContent` snapshot/default behavior.

## Validation Summary
- `get_errors` on all touched files: clean.
- Targeted tests passed:
  - `tests/unit/components/NotificationsPanel.test.jsx`
  - `tests/unit/hooks/useSettingsPageState.test.js`
- `npm run lint`: pass.

## Residual Notes
- Topic visible-content notifications are implemented in the client notification hook with subject-scoped listeners.
- Existing data without required fields (for example missing `subjectId`) is safely ignored and does not produce cross-tenant notifications.
