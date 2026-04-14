<!-- copilot/plans/active/autopilot-plan-notifications-suite-2026-04-14/phases/phase-04-settings-toggle-and-24h-deliverable-alerts.md -->
# Phase 04 - Settings Toggle and 24h Deliverable Alerts

## Objective
Allow users to disable new-content notifications and add due-soon alerts at 24h for deliverable tasks.

## Scope
- Add setting in [src/pages/Settings/Settings.tsx](src/pages/Settings/Settings.tsx) and persist in user profile.
- Respect toggle in notification creation paths.
- Create deterministic 24h due-soon notification path for deliverable assignments.

## Validation
- Toggle on/off functional check.
- Due-soon notification is not duplicated.

## Status
- Completed.
