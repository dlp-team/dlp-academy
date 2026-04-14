<!-- copilot/plans/active/autopilot-plan-notifications-suite-2026-04-14/phases/phase-02-notification-taxonomy-and-icon-contract.md -->
# Phase 02 - Notification Taxonomy and Icon Contract

## Objective
Enforce distinct notification categories and matching iconography across header, panel, and notifications page.

## Scope
- Update presentation mapper in [src/components/ui/notificationPresentation.tsx](src/components/ui/notificationPresentation.tsx).
- Ensure message notifications map to message icon and bell notifications to bell icon.
- Add type mappings for test and task content notifications.

## Validation
- Visual checks in header panel and notifications page.
- No regressions in mark-as-read and mark-all flows.

## Status
- Completed.
