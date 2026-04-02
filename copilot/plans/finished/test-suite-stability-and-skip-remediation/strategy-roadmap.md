<!-- copilot/plans/finished/test-suite-stability-and-skip-remediation/strategy-roadmap.md -->
# Strategy Roadmap - Test Suite Stability and Skip Remediation

## Phase Status Legend
- PLANNED
- IN_PROGRESS
- COMPLETED
- BLOCKED

## Ordered Phases

### Phase 01 - Baseline and Classification
- Status: COMPLETED
- Goal: obtain a reproducible snapshot of failures and skips across unit, rules, and e2e commands.
- Outputs:
  - fail/skip inventory with file-level mapping,
  - root-cause hypothesis per failing cluster,
  - priority-ranked remediation queue.

### Phase 02 - Unit Failure Remediation
- Status: COMPLETED
- Goal: make `npm run test` fully green by fixing test logic, mocks, and deterministic timing assumptions.
- Outputs:
  - patched failing unit tests or minimal production fixes if tests reveal real defects,
  - updated test utilities/mocks where required,
  - validation run evidence.

### Phase 03 - Rules Suite Remediation
- Status: COMPLETED
- Goal: make `npm run test:rules` fully green and reliable.
- Outputs:
  - fixed failing rules tests and/or surgical rules logic corrections,
  - preserved authorization intent,
  - updated assertions for explicit deny/allow behavior.

### Phase 04 - E2E Skip Elimination and Fixture Hardening
- Status: COMPLETED
- Goal: reduce avoidable `test.skip` usage by improving fixture readiness and deterministic preconditions.
- Outputs:
  - skip classification matrix (keep/remove/replace),
  - fixture or setup improvements for removable skips,
  - retained conditional skips documented with strict rationale.

### Phase 05 - Flake Hardening and Determinism
- Status: COMPLETED
- Goal: eliminate non-deterministic failures by improving waits, assertions, and setup boundaries.
- Outputs:
  - stabilized timing and state synchronization in tests,
  - targeted retries only when justified,
  - deterministic execution notes.

### Phase 06 - Final Verification and Closure
- Status: COMPLETED
- Goal: run final verification gate and prepare transition package to inReview.
- Outputs:
  - completed verification checklist,
  - review logs for any failed checks and fixes,
  - closure-ready summary and risk notes.

## Immediate Next Actions
1. Keep the four intentional skips documented and environment-gated.
2. Re-run `npm run test:e2e` whenever fixture flags or credentials change.
3. Plan lifecycle transition is complete; reopen only if new instability appears.

## Rollback Strategy
- Keep every remediation change small and scoped per failure cluster.
- Validate after each cluster fix before continuing.
- Revert only the minimal patch group if a regression appears.

## Quality Guardrails
- Do not silence failures by broad skipping.
- Prefer fixing deterministic preconditions over adding retries.
- Preserve existing behavior outside the test stabilization scope.
