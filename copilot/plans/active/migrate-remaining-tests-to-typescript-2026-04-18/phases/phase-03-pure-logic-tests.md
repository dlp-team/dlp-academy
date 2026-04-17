<!-- copilot/plans/active/migrate-remaining-tests-to-typescript-2026-04-18/phases/phase-03-pure-logic-tests.md -->
# Phase 3: Pure Logic Tests

## Objective

Convert low-risk non-JSX tests where extension changes should be mostly mechanical.

## Scope

- `tests/unit/utils/**`
- `tests/unit/services/**`
- `tests/unit/functions/**`
- other pure helper test files that do not render React components

## Tasks

1. Rename `.test.js` and `.spec.js` files in the pure-logic tranche to `.ts`
2. Fix any import-extension or implicit-any issues only as needed
3. Run targeted unit tests for touched folders
4. Run test-only type-checking after each batch

## Validation Gate

- [ ] All targeted pure-logic files migrated to `.ts`
- [ ] Touched unit tests pass
- [ ] `tsconfig.tests.json` check passes for touched files
