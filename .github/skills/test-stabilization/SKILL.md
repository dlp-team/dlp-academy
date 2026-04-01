---
# .github/skills/test-stabilization/SKILL.md
name: test-stabilization
description: Stabilize failing or flaky test suites across unit, rules, and e2e with deterministic fixes, skip classification, and final green validation.
---

# Test Stabilization Skill

## Objective
Drive suites to deterministic green state while preserving product behavior.

## Execution order
1. Baseline commands:
   - `npm run test`
   - `npm run test:rules`
   - `npm run test:e2e`
2. Classify issues by failure type and skip rationale.
3. Fix deterministic issues first (selectors/state/timing/fixtures).
4. Keep only intentional env-gated skips with documented rationale.
5. Re-run targeted specs, then full suites.

## Closure standard
- Unit and rules suites: zero failures.
- E2E: zero failures, skips documented and justified.
- Update plan artifacts and lossless report.
