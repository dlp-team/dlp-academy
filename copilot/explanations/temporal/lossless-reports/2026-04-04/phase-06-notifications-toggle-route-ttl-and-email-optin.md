<!-- copilot/explanations/temporal/lossless-reports/2026-04-04/phase-06-notifications-toggle-route-ttl-and-email-optin.md -->
# Lossless Change Report - Phase 06 Notifications Slice (Toggle Fix + Route + TTL + Email Opt-In)

## Requested Scope
- Continue the active plan into Phase 06 and implement notification interaction hardening plus foundational route/retention/email-sync behaviors.

## Preserved Behaviors
- Existing notification read/mark-all actions remain unchanged.
- Existing shortcut move request action buttons (`Aprobar`/`Rechazar`) remain available in panel and now also on full-history page.
- Existing settings structure (`notifications.email`) remains backward compatible.

## Touched Files
- Added: [src/pages/Notifications/Notifications.tsx](src/pages/Notifications/Notifications.tsx)
- Added: [src/utils/notificationRetentionUtils.ts](src/utils/notificationRetentionUtils.ts)
- Updated: [src/components/layout/Header.tsx](src/components/layout/Header.tsx)
- Updated: [src/components/ui/NotificationsPanel.tsx](src/components/ui/NotificationsPanel.tsx)
- Updated: [src/hooks/useNotifications.tsx](src/hooks/useNotifications.tsx)
- Updated: [src/App.tsx](src/App.tsx)
- Updated: [functions/index.js](functions/index.js)
- Added: [functions/security/shortcutMoveRequestEmailUtils.js](functions/security/shortcutMoveRequestEmailUtils.js)
- Updated: [tests/unit/components/NotificationsPanel.test.jsx](tests/unit/components/NotificationsPanel.test.jsx)
- Added: [tests/unit/functions/shortcut-move-request-email-optin.test.js](tests/unit/functions/shortcut-move-request-email-optin.test.js)
- Added: [tests/unit/utils/notificationRetentionUtils.test.js](tests/unit/utils/notificationRetentionUtils.test.js)
- Added: [tests/e2e/notifications.spec.js](tests/e2e/notifications.spec.js)
- Updated: [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/README.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/README.md)
- Updated: [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md)
- Updated: [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-06-notifications-and-email-sync-planned.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-06-notifications-and-email-sync-planned.md)
- Updated: [copilot/explanations/codebase/src/components/layout/Header.md](copilot/explanations/codebase/src/components/layout/Header.md)
- Updated: [copilot/explanations/codebase/src/components/ui/NotificationsPanel.md](copilot/explanations/codebase/src/components/ui/NotificationsPanel.md)
- Updated: [copilot/explanations/codebase/src/hooks/useNotifications.md](copilot/explanations/codebase/src/hooks/useNotifications.md)
- Updated: [copilot/explanations/codebase/src/App.md](copilot/explanations/codebase/src/App.md)
- Added: [copilot/explanations/codebase/src/pages/Notifications/Notifications.md](copilot/explanations/codebase/src/pages/Notifications/Notifications.md)
- Added: [copilot/explanations/codebase/src/utils/notificationRetentionUtils.md](copilot/explanations/codebase/src/utils/notificationRetentionUtils.md)
- Updated: [copilot/explanations/codebase/functions/index.md](copilot/explanations/codebase/functions/index.md)
- Added: [copilot/explanations/codebase/functions/security/shortcutMoveRequestEmailUtils.md](copilot/explanations/codebase/functions/security/shortcutMoveRequestEmailUtils.md)
- Added: [copilot/explanations/codebase/tests/unit/functions/shortcut-move-request-email-optin.test.md](copilot/explanations/codebase/tests/unit/functions/shortcut-move-request-email-optin.test.md)
- Updated: [copilot/explanations/codebase/tests/unit/components/NotificationsPanel.test.md](copilot/explanations/codebase/tests/unit/components/NotificationsPanel.test.md)
- Added: [copilot/explanations/codebase/tests/unit/utils/notificationRetentionUtils.test.md](copilot/explanations/codebase/tests/unit/utils/notificationRetentionUtils.test.md)
- Added: [copilot/explanations/codebase/tests/e2e/notifications.spec.md](copilot/explanations/codebase/tests/e2e/notifications.spec.md)

## File-by-File Verification
### [src/components/ui/NotificationsPanel.tsx](src/components/ui/NotificationsPanel.tsx)
- Added trigger-boundary aware outside-click guard to fix bell open/close race.
- Added `Ver todas` callback entrypoint to open full notifications route.
- Corrected subject navigation path to `/home/subject/:subjectId`.

### [src/components/layout/Header.tsx](src/components/layout/Header.tsx)
- Added trigger ref wiring for panel outside-click guard.
- Wired `onOpenAll` callback to close dropdown and navigate to `/notifications`.

### [src/pages/Notifications/Notifications.tsx](src/pages/Notifications/Notifications.tsx)
- Added dedicated notifications history page with mark-all action and shortcut request resolution controls.

### [src/utils/notificationRetentionUtils.ts](src/utils/notificationRetentionUtils.ts)
- Added retention policy map and expiration helper logic.

### [src/hooks/useNotifications.tsx](src/hooks/useNotifications.tsx)
- Added retention-based filtering and bounded cleanup delete pass for expired notifications.

### [functions/index.js](functions/index.js)
- Added `notifications.email` opt-in gating for owner/requester mail queue writes in shortcut move request callables.
- Delegated owner/requester email queue decisions to shared utility helpers for deterministic policy reuse.

### [functions/security/shortcutMoveRequestEmailUtils.js](functions/security/shortcutMoveRequestEmailUtils.js)
- Added reusable email opt-in policy helpers used by shortcut move request callables.
- Preserved legacy fallback semantics: requester mail remains enabled when requester profile is missing but fallback email exists.

### Tests
- [tests/unit/functions/shortcut-move-request-email-optin.test.js](tests/unit/functions/shortcut-move-request-email-optin.test.js): added deterministic unit coverage for owner/requester mail queue opt-in behavior, including legacy fallback semantics.
- [tests/unit/components/NotificationsPanel.test.jsx](tests/unit/components/NotificationsPanel.test.jsx): added full-history action and trigger-boundary interaction assertions.
- [tests/unit/utils/notificationRetentionUtils.test.js](tests/unit/utils/notificationRetentionUtils.test.js): added retention policy and expiration behavior coverage.
- [tests/e2e/notifications.spec.js](tests/e2e/notifications.spec.js): added browser-level `Ver todas` navigation coverage to `/notifications` route.

## Risks and Controls
- Risk: client-side TTL cleanup can increase delete writes during notification-heavy sessions.
  - Control: cleanup is bounded to expired ids from current snapshot and guarded against duplicate in-flight deletes.
- Risk: email opt-in semantics drift between owner/requester callable paths.
  - Control: centralized backend utility + dedicated deterministic unit suite for owner/requester queue decisions.

## Validation Summary
- `get_errors` clean for all touched source/test files in this slice.
- Executed:
  - `npm run test -- tests/unit/components/NotificationsPanel.test.jsx tests/unit/utils/notificationRetentionUtils.test.js`
    - Result: 2 test files passed, 8 tests passed.
  - `npm run test -- tests/unit/functions/shortcut-move-request-email-optin.test.js tests/unit/services/shortcutMoveRequestService.test.js`
    - Result: 2 test files passed, 8 tests passed.
  - `npm run test:e2e -- tests/e2e/notifications.spec.js`
    - Result: 1 test passed.

## Addendum (2026-04-04 Final Review Pass)
- Re-ran combined targeted unit validation:
  - `npm run test -- tests/unit/components/NotificationsPanel.test.jsx tests/unit/utils/notificationRetentionUtils.test.js tests/unit/functions/shortcut-move-request-email-optin.test.js tests/unit/services/shortcutMoveRequestService.test.js`
  - Result: 4 test files passed, 16 tests passed.
- Re-ran notifications e2e:
  - `npm run test:e2e -- tests/e2e/notifications.spec.js`
  - Result: 1 test passed.
- Confirmed diagnostics remain clean via `get_errors` on all touched Phase 06 source/test files.
- Lifecycle sync completed: Phase 06 transitioned from `IN_REVIEW` to `FINISHED` in plan docs.
