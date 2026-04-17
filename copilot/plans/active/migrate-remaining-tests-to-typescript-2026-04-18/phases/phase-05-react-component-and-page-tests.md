<!-- copilot/plans/active/migrate-remaining-tests-to-typescript-2026-04-18/phases/phase-05-react-component-and-page-tests.md -->
# Phase 5: React Component and Page Tests

## Objective

Migrate JSX-based tests to `.tsx` with careful handling for component props, render helpers, inline fixtures, and mocked modules.

## Scope

- `tests/unit/components/**`
- `tests/unit/pages/**`
- any remaining `.jsx` test files under `tests/unit/`

## Tasks

1. Rename `.jsx` tests to `.tsx`
2. Fix JSX-specific typing issues and mock component signatures
3. Validate representative suites by domain (`admin`, `institution-admin`, `home`, `topic`, `quizzes`, etc.)
4. Keep changes lossless and avoid unrelated component refactors

## Validation Gate

- [ ] Remaining `.jsx` tests migrated to `.tsx`
- [ ] React Testing Library tests still pass
- [ ] No TSX-only typing regressions remain in touched files
