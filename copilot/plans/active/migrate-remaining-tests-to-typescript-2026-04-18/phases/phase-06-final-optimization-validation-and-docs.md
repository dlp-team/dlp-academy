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

- [ ] No remaining JS/JSX test files in scope without explicit exception notes
- [ ] `npm run test:unit` passes
- [ ] `npm run test:rules` passes
- [ ] `npx tsc --noEmit -p tsconfig.tests.json` passes
- [ ] Docs updated
- [ ] Residual risks documented if any remain
