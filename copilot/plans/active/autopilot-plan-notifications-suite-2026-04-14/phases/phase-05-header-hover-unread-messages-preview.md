<!-- copilot/plans/active/autopilot-plan-notifications-suite-2026-04-14/phases/phase-05-header-hover-unread-messages-preview.md -->
# Phase 05 - Header Hover Unread Messages Preview

## Objective
Show up to 3 unread direct messages while hovering the header message icon.

## Scope
- Extend [src/components/layout/Header.tsx](src/components/layout/Header.tsx) with hover-only panel.
- Feed preview from unread direct message notifications or directMessages query.
- Keep panel visible only during hover/focus interaction.

## Validation
- Hover behavior (enter/leave) on desktop.
- Graceful behavior when 0-2 unread messages.

## Status
- Completed.
