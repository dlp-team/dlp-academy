<!-- copilot/plans/inReview/test-suite-stability-and-skip-remediation/phases/phase-04-e2e-skip-elimination-and-fixture-hardening.md -->
# Phase 04 - E2E Skip Elimination and Fixture Hardening

## Status
- COMPLETED

## Objective
Reduce avoidable e2e skips and improve fixture readiness so key end-to-end flows execute reliably.

## Execution Steps
1. Build exact skip inventory (`test.skip` and conditional gates).
2. For each skip, choose one outcome:
   - remove and run now,
   - replace with deterministic setup,
   - keep with strict env rationale.
3. Improve fixture discovery/seeding for high-value guarded flows.
4. Re-run targeted e2e specs to confirm skip reduction.

## Deliverables
- Skip classification matrix with decisions and rationale.
- Fixture/setup hardening changes for removable skip cases.
- Updated e2e execution evidence.

## Risks and Controls
- Risk: Converting intentional env guards into brittle mandatory tests.
- Control: Keep genuine credential/seed requirements explicit and documented.

## Exit Criteria
- Avoidable skips are removed or converted to deterministic executable tests.
