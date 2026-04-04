<!-- copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-06-notifications-and-email-sync-planned.md -->
# Phase 06 - Notifications and Email Sync (FINISHED)

## Objective
Fix notification interaction defects and extend notifications to a dedicated page plus optional email delivery.

## Planned Changes
- Fix bell toggle open/close state behavior.
- Add dedicated notifications route/page.
- Define type-based TTL cleanup strategy.
- Add settings toggle for email-linked notifications.

## Progress Update (2026-04-04)
- Fixed bell/panel interaction race by adding trigger-boundary aware outside-click handling in [src/components/ui/NotificationsPanel.tsx](src/components/ui/NotificationsPanel.tsx) and [src/components/layout/Header.tsx](src/components/layout/Header.tsx).
- Added dedicated notifications history route `/notifications` and page [src/pages/Notifications/Notifications.tsx](src/pages/Notifications/Notifications.tsx), wired in [src/App.tsx](src/App.tsx).
- Corrected notification subject deep-link navigation to `/home/subject/:subjectId` in panel/page interactions.
- Implemented type-based retention strategy utility in [src/utils/notificationRetentionUtils.ts](src/utils/notificationRetentionUtils.ts).
- Integrated TTL filtering + cleanup pass in [src/hooks/useNotifications.tsx](src/hooks/useNotifications.tsx) to remove expired user notifications by retention type.
- Integrated email opt-in gating for shortcut move request mail queue writes in [functions/index.js](functions/index.js), honoring `users/{uid}.notifications.email !== false`.
- Extracted shortcut move request email opt-in decision helpers into [functions/security/shortcutMoveRequestEmailUtils.js](functions/security/shortcutMoveRequestEmailUtils.js) and wired both create/resolve callables to use the shared policy utility.
- Added deterministic coverage:
  - [tests/unit/components/NotificationsPanel.test.jsx](tests/unit/components/NotificationsPanel.test.jsx)
  - [tests/unit/utils/notificationRetentionUtils.test.js](tests/unit/utils/notificationRetentionUtils.test.js)
  - [tests/unit/functions/shortcut-move-request-email-optin.test.js](tests/unit/functions/shortcut-move-request-email-optin.test.js)
- Added browser-level notifications route coverage in [tests/e2e/notifications.spec.js](tests/e2e/notifications.spec.js) for bell-panel `Ver todas` navigation.
- Completed final optimization/risk-review validation pass with fresh unit and e2e reruns, confirming deterministic behavior in both panel and full-history flows.

## Validation Evidence
- `npm run test -- tests/unit/components/NotificationsPanel.test.jsx tests/unit/utils/notificationRetentionUtils.test.js`
- `npm run test -- tests/unit/functions/shortcut-move-request-email-optin.test.js tests/unit/services/shortcutMoveRequestService.test.js`
- `npm run test:e2e -- tests/e2e/notifications.spec.js`
- `npm run test -- tests/unit/components/NotificationsPanel.test.jsx tests/unit/utils/notificationRetentionUtils.test.js tests/unit/functions/shortcut-move-request-email-optin.test.js tests/unit/services/shortcutMoveRequestService.test.js`
- `npm run test:e2e -- tests/e2e/notifications.spec.js` (final review rerun)
- `get_errors` clean for all touched source/test files in this slice.

## Remaining in Phase 06
- None. Phase implementation, optimization pass, and review validation are complete.

## Risks and Controls
- Risk: TTL cleanup removes important records too early.
  - Control: conservative defaults and type-specific retention map.

## Exit Criteria
- Bell behavior is deterministic.
- Notifications page renders full history subject to retention policy.
- Email sync remains opt-in and user-controlled.
