<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/phases/phase-08-topic-create-actions-regression-recovery.md -->
# Phase 08 - Topic Create Actions Regression Recovery

## Status
- PLANNED

## Objective
Restore missing topic create controls for quizzes, exams, and study guides using prior main behavior as baseline.

## Scope
- Compare current topic create flow against main branch baseline.
- Reintroduce missing UI triggers and handlers.
- Preserve existing permission guards and data constraints.

## Validation
- Baseline behavior parity checks.
- Role and permission checks.
- `get_errors` + targeted topic tests.
