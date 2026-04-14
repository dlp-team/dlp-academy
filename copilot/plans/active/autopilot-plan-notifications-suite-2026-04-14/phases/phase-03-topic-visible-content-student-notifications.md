<!-- copilot/plans/active/autopilot-plan-notifications-suite-2026-04-14/phases/phase-03-topic-visible-content-student-notifications.md -->
# Phase 03 - Topic Visible Content Student Notifications

## Objective
Create student notifications when teacher publishes visible topic content.

## Scope
- Hook content creation/update events in [functions/index.js](functions/index.js) or existing notification generation paths.
- Determine content type and emit notification type:
  - test,
  - task,
  - generic material.
- Keep institution and recipient scoping strict.

## Validation
- Event simulation in local flow.
- Notification payload correctness and type mapping.

## Status
- Completed.
