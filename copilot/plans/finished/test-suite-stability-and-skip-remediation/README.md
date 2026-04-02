<!-- copilot/plans/finished/test-suite-stability-and-skip-remediation/README.md -->
# Test Suite Stability and Skip Remediation Plan

## Status
- Current lifecycle state: FINISHED (created in todo, executed in active, moved through inReview, and closed in finished)
- Start date: 2026-04-01
- Current phase: Phase 06 - Final Verification and Closure (COMPLETED)
- Execution summary:
  - Unit suite stabilized and verified: `71/71` files, `385/385` tests passing.
  - Rules suite stabilized and verified: `2/2` files, `44/44` tests passing.
  - E2E suite stabilized and verified: `31` passing, `0` failing, `4` intentional skips.

## Problem Statement
The project test ecosystem currently has failing tests and skipped tests across unit, rules, and e2e coverage. The goal is to stabilize the suite so it becomes predictable, actionable, and close to "green-by-default" as possible without masking real regressions.

## Scope
- Diagnose and fix active failures in `npm run test` and `npm run test:rules`.
- Inventory all skips in e2e and classify each one as:
  - removable/fixable now,
  - fixture/env-gated and intentional,
  - obsolete and removable.
- Reduce avoidable skip usage by hardening fixtures and test setup.
- Preserve existing product behavior (lossless) while fixing tests.
- Create/update required lossless reports for code changes.

## Out of Scope
- Large product feature work unrelated to failing/skipped tests.
- Broad refactors that are not required for test reliability.
- Production deployment actions.

## Success Criteria
- `npm run test` completes with zero failures.
- `npm run test:rules` completes with zero failures.
- e2e suite runs with deterministic behavior for available fixtures.
- Remaining skipped tests are explicitly justified (environment/credential dependent) and documented in plan artifacts.
- No silent regressions introduced in adjacent functionality.

## Key Decisions and Assumptions
- Execution follows `copilot/protocols/plan-creation-protocol.md` and `copilot/protocols/lossless-change-protocol.md`.
- The remediation proceeds in phased order from baseline diagnosis to verification gate.
- If credentials/seeds are missing for specific e2e flows, tests remain conditionally skipped only with explicit rationale.

## Plan Artifacts
- `strategy-roadmap.md`
- `phases/phase-01-baseline-and-classification.md`
- `phases/phase-02-unit-failure-remediation.md`
- `phases/phase-03-rules-suite-remediation.md`
- `phases/phase-04-e2e-skip-elimination-and-fixture-hardening.md`
- `phases/phase-05-flake-hardening-and-determinism.md`
- `phases/phase-06-final-verification-and-closure.md`
- `reviewing/verification-checklist-2026-04-01.md`
- `working/failure-and-skip-inventory-2026-04-01.md`

## Immediate Next Step
Plan closed in `finished`. Keep skip rationale updated only when fixture/credential conditions change.
