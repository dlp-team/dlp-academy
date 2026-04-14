<!-- copilot/plans/active/autopilot-plan-notifications-suite-2026-04-14/working/implementation-log.md -->
# Implementation Log

## 2026-04-14
- Created active plan package for AUTOPILOT notifications+messages intake.
- Scoped execution files:
  - [src/components/layout/Header.tsx](src/components/layout/Header.tsx)
  - [src/hooks/useNotifications.tsx](src/hooks/useNotifications.tsx)
  - [src/components/ui/notificationPresentation.tsx](src/components/ui/notificationPresentation.tsx)
  - [src/components/ui/NotificationsPanel.tsx](src/components/ui/NotificationsPanel.tsx)
  - [src/pages/Notifications/Notifications.tsx](src/pages/Notifications/Notifications.tsx)
  - [src/pages/Messages/Messages.tsx](src/pages/Messages/Messages.tsx)
  - [functions/index.js](functions/index.js)
  - [src/pages/Settings/Settings.tsx](src/pages/Settings/Settings.tsx)
- Pending implementation starts at phase-02.
- Completed phase-02 icon contract updates:
  - Task notifications (`assignment_new`) now render a dedicated task icon.
  - Test notifications (`topic_quiz_new`) now render a dedicated test icon.
- Completed phase-03 student visible-content notifications in [src/hooks/useNotifications.tsx](src/hooks/useNotifications.tsx):
  - Task notifications from `topicAssignments` (new).
  - Test notifications from `quizzes` (new).
  - Material notifications from `documents` and `resumen` (new).
  - Subject-scoped listeners chunked by enrolled subject ids.
- Completed phase-04 settings + due-soon alignment:
  - Added `notifications.newContent` toggle wiring in settings UI/state.
  - Preserved and routed existing deterministic 24h due-soon alerts.
- Completed phase-05 header hover preview:
  - Added hover/focus unread preview card (max 3) for messages shortcut.
- Completed phase-06 navigation and formula dedup:
  - Bell panel item click now opens notifications history first.
  - Notifications page item click now follows route/hyperlink payload.
  - Message rendering now strips duplicate plain formula line when same formula already renders in KaTeX context.
- Completed phase-07 validation:
  - `get_errors` clean on all touched files.
  - Targeted tests pass for updated unit suites.
  - `npm run lint` pass.
