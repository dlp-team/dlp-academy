<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-09/reviewing/deep-risk-analysis-2026-04-09.md -->
# Deep Risk Analysis

## Status
- OPEN

## Security and Permission Boundaries
- Risk: Shortcut copy/cut flows could accidentally preserve shared access metadata.
- Mitigation: enforce owner-first metadata rewrite and explicit removal/rebuild of share envelopes on copy targets.
- Validation: unit tests for ownerId/institutionId/share list outcomes for copy and undo paths.

## Data Integrity and Rollback Safety
- Risk: Nested content duplication can orphan topic children or duplicate IDs.
- Mitigation: deterministic ID regeneration map and transaction-safe write order.
- Validation: targeted test matrix for topics/quizzes/documents/exams and rollback on partial failure.

## Runtime Failure Modes
- Risk: Undo queue replacement can discard expected recoverability when rapid actions occur.
- Mitigation: explicit single-slot policy with UI copy and replacement timestamp handling.
- Validation: keyboard and action-handler tests simulating rapid sequential operations.

## UX Consistency Risks
- Risk: Notification dedupe could suppress legitimate repeated events from distinct actions.
- Mitigation: dedupe keys scoped to event instance IDs, not only event type.
- Validation: event dispatch tests with same-type distinct IDs and replay behavior checks.

## Theme and Rendering Risks
- Risk: Scrollbar styling changes can regress on platform/browser combinations.
- Mitigation: fallback-safe CSS and no hard dependency on deprecated overlay behaviors.
- Validation: manual parity checks on Windows and Chromium path, plus visual snapshot tests when available.

## Out-of-Scope Risk Logging
- Any risk identified but deferred will be appended to [copilot/plans/out-of-scope-risk-log.md](../../../out-of-scope-risk-log.md) with date, affected surfaces, and follow-up action.
