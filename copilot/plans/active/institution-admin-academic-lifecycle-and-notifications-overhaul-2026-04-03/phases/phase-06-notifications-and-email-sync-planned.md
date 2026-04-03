<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-06-notifications-and-email-sync-planned.md -->
# Phase 06 - Notifications and Email Sync (PLANNED)

## Objective
Fix notification interaction defects and extend notifications to a dedicated page plus optional email delivery.

## Planned Changes
- Fix bell toggle open/close state behavior.
- Add dedicated notifications route/page.
- Define type-based TTL cleanup strategy.
- Add settings toggle for email-linked notifications.

## Risks and Controls
- Risk: TTL cleanup removes important records too early.
  - Control: conservative defaults and type-specific retention map.

## Exit Criteria
- Bell behavior is deterministic.
- Notifications page renders full history subject to retention policy.
- Email sync remains opt-in and user-controlled.
