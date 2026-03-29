# Phase 02: Patch Permission Check

## Objective
Restore subject drag-and-drop by fixing the permission check.

## Changes
- Pass current userId explicitly to Home page handlers.
- Use userId for permission checks in subject move logic.

## Risks
- Regression in folder DnD (mitigated by targeted testing).

## Completion Notes
- Patch applied and verified with no new errors.
