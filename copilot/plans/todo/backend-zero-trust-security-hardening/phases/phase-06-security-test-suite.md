<!-- copilot/plans/todo/backend-zero-trust-security-hardening/phases/phase-06-security-test-suite.md -->
# Phase 06 — Security Test Suite

## Tasks
- Build allow/deny tests per collection action for each role.
- Add tenant-escape negative tests.
- Add ownership-escalation negative tests.
- Add storage allow/deny tests for each path class.
- Add tests for privileged Cloud Functions authorization boundaries.
- Add regression tests for previously working, authorized CRUD flows.
- Execute all created tests and fail phase if any test fails.

## Mandatory execution commands
- `npm run test:rules`
- `npm run test`
- `npm run test -- tests/unit/**`
- Any feature-specific security/regression commands added in this phase

## Outputs
- Expanded `tests/rules/` coverage with explicit adversarial cases.
- CI-ready security gate command set.
- Evidence log of executed test runs and pass/fail outcomes.
