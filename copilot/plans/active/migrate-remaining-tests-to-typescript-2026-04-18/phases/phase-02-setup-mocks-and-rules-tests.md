<!-- copilot/plans/active/migrate-remaining-tests-to-typescript-2026-04-18/phases/phase-02-setup-mocks-and-rules-tests.md -->
# Phase 2: Setup, Mocks, and Rules Tests

## Objective

Migrate the highest-coupling test infrastructure files first so later test-file renames have a stable base.

## Tasks

1. Migrate `tests/setup.js` to TypeScript-compatible form
2. Migrate `tests/mocks/firebase-functions-v2-https.js`
3. Migrate rules tests under `tests/rules/`
4. Update Vitest alias/setup references if extensions change
5. Validate `npm run test:rules`

## Validation Gate

- [ ] Setup file resolves correctly in Vitest
- [ ] Mock alias still resolves from `vitest.config.js`
- [ ] Rules tests pass after migration
- [ ] No module-resolution regressions introduced
