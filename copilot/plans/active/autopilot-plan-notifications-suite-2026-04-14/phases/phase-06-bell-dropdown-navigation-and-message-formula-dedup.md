<!-- copilot/plans/active/autopilot-plan-notifications-suite-2026-04-14/phases/phase-06-bell-dropdown-navigation-and-message-formula-dedup.md -->
# Phase 06 - Bell Dropdown Navigation and Message Formula Dedup

## Objective
Fix navigation behavior in bell dropdown and remove duplicated plain-text formula rendering in messages.

## Scope
- Bell dropdown click flow:
  - dropdown item click routes to notifications page,
  - notifications page item click routes to target hyperlink.
- Formula dedup in [src/pages/Messages/Messages.tsx](src/pages/Messages/Messages.tsx):
  - keep processed LaTeX context,
  - avoid duplicate unprocessed plain formula line in message body.

## Validation
- Navigation flow tests/manual checks.
- Message rendering checks with formula references.

## Status
- Completed.
