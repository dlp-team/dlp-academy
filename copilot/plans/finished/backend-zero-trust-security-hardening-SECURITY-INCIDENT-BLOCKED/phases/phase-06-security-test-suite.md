<!-- copilot/plans/todo/backend-zero-trust-security-hardening/phases/phase-06-security-test-suite.md -->
# Phase 06 — Security Test Suite

## Status
- Partially completed (initial expansion done; full mandatory scope not met, reviewed 2026-03-12)

## Tasks
- Build allow/deny tests per collection action for each role.
- Add tenant-escape negative tests.
- Add ownership-escalation negative tests.
- Add storage allow/deny tests for each path class.
- Add tests for privileged Cloud Functions authorization boundaries.
- Add regression tests for previously working, authorized CRUD flows.
- Execute all created tests and fail phase if any test fails.
- Add edge-case tests for missing fields, tampered payloads, and invalid transitions.
- Add high-volume scenario tests for mass-read/mass-write abuse attempts.

## Mandatory execution commands
- `npm run test:rules`
- `npm run test`
- `npm run test -- tests/unit/**`
- Any feature-specific security/regression commands added in this phase
- `npm run lint`
- `npx tsc --noEmit`

## Outputs
- Expanded `tests/rules/` coverage with explicit adversarial cases.
- CI-ready security gate command set.
- Evidence log of executed test runs and pass/fail outcomes.

## Exit criteria
- 100% planned security tests created.
- 100% planned security tests executed.
- 0 failing tests in this phase.

## Completed artifacts
- Added adversarial tests in `tests/rules/firestore.rules.test.js` for:
	- self role escalation denial
	- self institution reassignment denial
	- institution admin global-admin promotion denial
	- global admin promotion allow path
- Added Storage rules test suite in `tests/rules/storage.rules.test.js` (path coverage implemented, currently 5/8 pass).
- Added privileged callable boundary test suite in `tests/unit/functions/preview-handler.test.js` (6/6 pass).

## Missing mandatory scope (reviewed 2026-03-12)
- Storage allow/deny test suite by path class was added but currently failing in allow-path execution under emulator (`tests/rules/storage.rules.test.js`).
- Mandatory quality gates are not fully green (`npm run lint` fails due repo backlog; `npx tsc --noEmit` blocked by missing `typescript`).

## Execution evidence
- `npm run test:rules` → pass (13/13)
- `npm run test` → pass (45/45, 283/283)
- `npm run test -- tests/unit/functions/guards.test.js` → pass (1/1 file, 4/4)
