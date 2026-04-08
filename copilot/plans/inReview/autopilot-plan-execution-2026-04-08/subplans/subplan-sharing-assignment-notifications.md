<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/subplans/subplan-sharing-assignment-notifications.md -->
# Subplan: Sharing and Assignment Notifications

## Objective
Trigger notifications when a subject is shared with users/classes/enrolled students.

## Requested Outcomes
- Notify recipients when subject is shared with another user.
- Notify class-level targets when assigned to class groups.
- Notify enrolled students when assignment applies directly to them.

## Candidate Target Files
- `src/services/**`
- `functions/**` (if notification dispatch is backend-driven)
- `src/firebase/**`

## Risks
- Multi-tenant leaks if notification queries are not institution-scoped.
- Duplicate notifications for overlapping assignment targets.

## Validation
- Tenant-scoped notification tests.
- Duplicate suppression checks.
- Permission verification for recipient visibility.
