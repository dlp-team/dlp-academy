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

- [x] Setup file resolves correctly in Vitest
- [x] Mock alias still resolves from `vitest.config.js`
- [x] Rules tests pass after migration
- [x] No module-resolution regressions introduced

## Status: COMPLETE (2026-04-18)

## Validation Evidence

- `npm run test:unit -- tests/unit/utils/stringUtils.test.js`
- `npm run test:rules`
- `npm run test:types`

## Implementation Notes

- Renamed `tests/setup.js` to `tests/setup.ts`.
- Renamed `tests/mocks/firebase-functions-v2-https.js` to `tests/mocks/firebase-functions-v2-https.ts`.
- Renamed both rules test files to `.ts`.
- Updated `vitest.config.js` to reference the renamed setup and mock files.
- Fixed the only post-rename typing issue in `tests/rules/storage.rules.test.ts`.
