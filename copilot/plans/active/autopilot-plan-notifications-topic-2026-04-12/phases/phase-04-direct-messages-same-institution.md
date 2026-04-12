<!-- copilot/plans/active/autopilot-plan-notifications-topic-2026-04-12/phases/phase-04-direct-messages-same-institution.md -->
# Phase 04 - Direct Messages (Same Institution)

## Objective
Introduce direct messaging constrained to users within the same institution.

## Planned Changes
- Add Firestore collection/shape for direct messages and thread metadata.
- Add hooks/services for send/list/read/mark-read flows.
- Enforce institution consistency at read/write boundaries.
- Integrate notification hook for new direct messages.

## Validation
- Positive same-institution send/read tests.
- Negative cross-institution access denial.

## Status
- `COMPLETED`
