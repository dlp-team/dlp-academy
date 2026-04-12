<!-- copilot/explanations/temporal/lossless-reports/2026-04-12/autopilot-plan-messages-hub-implementation.md -->
# Lossless Change Report - Messages Hub + Notification Channel Split

## Date
- 2026-04-12

## Requested Scope
- Create a dedicated direct-messages section with a clear header entrypoint.
- Show all user conversations with thread detail and send flow.
- Preserve Subject/profile direct-message entrypoints.
- Show participant role and shared-subject context.
- Separate message notifications from general notifications.
- Reuse a shared visual primitive across messages and notifications.

## Preserved Behaviors
- Existing protected-route authentication model remains unchanged.
- Existing general notifications panel interactions (open/read/resolve actions) remain intact for non-message notification types.
- Existing direct-message backend service contract (`sendDirectMessage`) remains intact.
- Existing shortcut move request approval/rejection actions in notification cards remain intact.

## Implemented Changes
- Added dedicated route and page for direct messages:
  - [src/App.tsx](../../../../../src/App.tsx)
  - [src/pages/Messages/Messages.tsx](../../../../../src/pages/Messages/Messages.tsx)
- Added reusable communication row primitive and adopted it in notification rendering:
  - [src/components/ui/CommunicationItemCard.tsx](../../../../../src/components/ui/CommunicationItemCard.tsx)
  - [src/components/ui/NotificationItemCard.tsx](../../../../../src/components/ui/NotificationItemCard.tsx)
- Split message and general notification channels in shell/history views:
  - [src/components/layout/Header.tsx](../../../../../src/components/layout/Header.tsx)
  - [src/pages/Notifications/Notifications.tsx](../../../../../src/pages/Notifications/Notifications.tsx)
- Added deterministic conversation/profile helpers:
  - [src/utils/directMessageUtils.ts](../../../../../src/utils/directMessageUtils.ts)

## Tests Added/Updated
- Added:
  - [tests/unit/components/CommunicationItemCard.test.jsx](../../../../../tests/unit/components/CommunicationItemCard.test.jsx)
  - [tests/unit/utils/directMessageUtils.test.js](../../../../../tests/unit/utils/directMessageUtils.test.js)

## Validation Summary
- `get_errors` on touched source files: clean.
- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- Targeted tests: pass for communication card and direct message utils suites.
- Full suite: `npm run test` pass (166 files, 750 tests).

## Risk Notes
- Message/general channel split is implemented at UI filtering layer; backend notification schema remains unchanged and additive.
- Realtime listeners in Messages page use sender+recipient queries merged client-side; no rules broadening was introduced in this block.
- No out-of-scope risks identified that require new log entries in [copilot/plans/out-of-scope-risk-log.md](../../../../../copilot/plans/out-of-scope-risk-log.md).