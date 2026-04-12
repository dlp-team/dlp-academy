<!-- copilot/plans/finished/autopilot-plan-notifications-topic-2026-04-12/phases/phase-06-topic-study-guide-teacher-access.md -->
# Phase 06 - Topic Study Guide Teacher Access Fix

## Objective
Remove unintended admin-only gating so teachers can access/interact with study guide in Topic view according to existing ownership/institution constraints.

## Planned Changes
- Trace current checks in Topic logic and access utilities.
- Adjust permission conditions to include authorized teachers.
- If needed, align Firestore rules with least-privilege teacher access.

## Validation
- Teacher can open and interact with study guide controls.
- Student/admin behaviors remain correct.

## Status
- `COMPLETED`
