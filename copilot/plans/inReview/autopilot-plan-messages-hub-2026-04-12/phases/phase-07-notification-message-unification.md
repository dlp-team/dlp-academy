<!-- copilot/plans/inReview/autopilot-plan-messages-hub-2026-04-12/phases/phase-07-notification-message-unification.md -->
# Phase 07 - Notification and Message Unification

## Objective
Unify message/non-message visual primitives while splitting header behavior between message notifications and general notifications.

## Planned Changes
- Extend shared notification/message item component(s) for channel-aware rendering.
- Update header to expose message notification stream separately from general events.
- Keep Notifications page focused on non-message events unless explicitly requested.

## Validation
- Header shows correct counts and channel segmentation.
- Existing notification interactions remain stable.

## Status
- `COMPLETED`

