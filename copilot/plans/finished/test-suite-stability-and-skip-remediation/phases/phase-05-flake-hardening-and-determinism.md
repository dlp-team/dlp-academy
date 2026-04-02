<!-- copilot/plans/finished/test-suite-stability-and-skip-remediation/phases/phase-05-flake-hardening-and-determinism.md -->
# Phase 05 - Flake Hardening and Determinism

## Status
- COMPLETED

## Objective
Eliminate intermittent test behavior caused by race conditions, unstable waits, and non-deterministic state assumptions.

## Execution Steps
1. Identify flaky patterns from reruns and failed traces.
2. Replace timing guesses with state-based assertions.
3. Harden setup/teardown isolation and shared test data handling.
4. Re-run impacted specs multiple times for confidence.

## Deliverables
- Deterministic test updates for flaky areas.
- Stability notes attached to inventory and review checklist.
- Evidence from repeated pass runs.

## Risks and Controls
- Risk: Masking flakes with broad retries/timeouts.
- Control: Prefer explicit readiness checks and minimal targeted retries only if unavoidable.

## Exit Criteria
- Previously flaky paths pass consistently in repeated runs.
