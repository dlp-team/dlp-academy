<!-- copilot/plans/finished/test-suite-stability-and-skip-remediation/phases/phase-01-baseline-and-classification.md -->
# Phase 01 - Baseline and Classification

## Status
- COMPLETED

## Objective
Build a deterministic baseline of all current failing and skipped tests so remediation work is prioritized by impact and risk.

## Execution Steps
1. Run `npm run test` and record failing suites/tests.
2. Run `npm run test:rules` and map failures to affected rule areas.
3. Run `npm run test:e2e` and separate hard failures from conditional skips.
4. Build a remediation queue grouped by shared root cause.

## Deliverables
- Updated `working/failure-and-skip-inventory-2026-04-01.md` with concrete evidence.
- Initial cluster list (unit, rules, e2e, skip categories).
- Prioritized sequence for Phase 02 through Phase 05.

## Risks and Controls
- Risk: Baseline noise from missing credentials/seeds.
- Control: Mark environment-gated results explicitly instead of treating them as product regressions.

## Exit Criteria
- Every failing/skip item is inventoried with a category and next action.
