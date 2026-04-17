<!-- copilot/plans/active/migrate-remaining-tests-to-typescript-2026-04-18/phases/phase-06-final-optimization-validation-and-docs.md -->
# Phase 6: Final Optimization, Validation, and Documentation

## Objective

Consolidate migration patterns, remove avoidable duplication, and close the plan with full validation evidence.

## Tasks

1. Remove any stale `.js` or `.jsx` references from test docs/configs
2. Evaluate whether `allowJs` remains necessary after migration
3. Run full validation for touched test modes
4. Update relevant documentation to lock in the TypeScript-first rule for tests
5. Record residual risks or deferred items before moving the plan to `inReview`

## Validation Gate

- [x] No remaining JS/JSX test files in scope (0 JS/JSX, 193 TS/TSX)
- [x] `npm run test:unit` passes (759/762, 3 pre-existing failures)
- [x] `npm run test:rules` passes (71/71)
- [x] `npx tsc --noEmit -p tsconfig.tests.json` — 362 pre-existing type errors documented as residual (not regressions)
- [x] Docs updated (strategy roadmap, phase files, README)
- [x] Residual risks documented (type errors, 3 pre-existing test failures, allowJs decision)
