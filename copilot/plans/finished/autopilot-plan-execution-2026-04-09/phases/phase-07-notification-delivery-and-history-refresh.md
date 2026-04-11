<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-09/phases/phase-07-notification-delivery-and-history-refresh.md -->
# Phase 07 - Notification Delivery and History Refresh

## Status
- IN_REVIEW

## Objective
Deliver requested notification placement, lifecycle, iconography, and history-style parity updates.

## Scope
- Place live notification cards in bottom-left region.
- Extend dismissal lifecycle to 10 seconds where requested.
- Prevent duplicate resurfacing for the same notification instance.
- Replace generic icon treatment with event-specific icon mappings and simplified visual tokens.
- Align notification history card visuals with live notification style language.

## Risks
- Dedupe policy could suppress legitimate repeated events if keying is incorrect.
- Style token changes may impact non-target notification types.

## Validation
- Targeted tests for notification dedupe and expiration logic.
- Manual checks for bottom-left stack behavior and history parity.
- `get_errors`, `npm run lint`, `npx tsc --noEmit`.

## Exit Criteria
- Notification lifecycle and placement match requested UX.
- Duplicate replay is prevented for same notification instance.
- History and live cards share cohesive clean visual system.

## Implementation Update (2026-04-09)
- Reworked `AppToast` notification surface to lower-left placement with 10-second auto-dismiss.
- Added per-user seen-notification dedupe in header via session storage (`dlp-seen-notification-toasts:<uid>`).
- Replaced generic icon treatment in dropdown/history notifications with type-based icon+tone mapping.
- Added shared visual utility (`src/utils/notificationVisualUtils.ts`) to centralize notification style decisions.

## Validation Evidence (2026-04-09)
- `get_errors` on touched notification files -> PASS.
- `npm run test -- tests/unit/components/NotificationsPanel.test.jsx tests/unit/components/AppToast.test.jsx` -> PASS.
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> PASS.
