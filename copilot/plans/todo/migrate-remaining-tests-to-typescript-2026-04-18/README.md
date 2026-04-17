<!-- copilot/plans/todo/migrate-remaining-tests-to-typescript-2026-04-18/README.md -->
# Migrate Remaining Tests to TypeScript

## Status: TODO
## Created: 2026-04-18
## Branch: feature/hector/e2e-firebase-emulators-2026-04-17

## Problem Statement

The repository still has a large amount of test code under `tests/` using `.js` and `.jsx` even though the project is operating under a TypeScript-first rule.

Current remaining scope snapshot:
- 169 files under `tests/` still use JavaScript extensions
- 92 files are `.js`
- 77 files are `.jsx`
- largest clusters are `tests/unit/hooks`, `tests/unit/utils`, `tests/unit/pages/institution-admin`, `tests/unit/pages/admin`, and `tests/unit/components`

The E2E suite has already been migrated to `.ts`, so the remaining gap is concentrated in unit, rules, setup, and mock files.

## Goal

Migrate the remaining test files from `.js` and `.jsx` to `.ts` and `.tsx` in controlled tranches, while preserving current behavior and adding real test-side TypeScript validation where it is currently missing.

## In Scope

- Rename remaining test files in `tests/` from `.js` to `.ts` and `.jsx` to `.tsx`
- Update imports and path aliases affected by extension changes
- Introduce test-focused TypeScript validation so migrated files are actually type-checked
- Keep Vitest, rules tests, Playwright, and local test setup working after the migration
- Document migration progress and residual edge cases by tranche

## Out of Scope

- Migrating application source files outside `tests/`
- Refactoring production logic unrelated to type compatibility
- Rewriting working tests for stylistic reasons only
- Broad test-architecture redesign unless a specific blocker requires it

## Key Constraints

- `tsconfig.json` currently includes only `src`, so test files are not part of current TypeScript validation
- `allowJs` is enabled today, which reduces pressure to migrate but also hides drift
- `tests/setup.js`, `tests/mocks/firebase-functions-v2-https.js`, and rules tests may require special handling due to runtime/config coupling
- JSX-based unit tests will likely need `.tsx`, not `.ts`

## Success Criteria

- No remaining `.js` or `.jsx` files under `tests/` unless explicitly documented as an exception
- Vitest unit suite still passes
- Rules tests still pass
- E2E suite still resolves helpers/setup without extension regressions
- Test-focused type-checking runs cleanly for migrated files
- Documentation updated to lock in the TypeScript-first test rule

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| JSX test files need real TSX conversions, not simple renames | Medium | Migrate component/page tests in dedicated phase |
| Test files are not currently part of TypeScript validation | High | Add a dedicated tests TS config early in the plan |
| Rules tests or mocks depend on current JS module behavior | Medium | Handle setup, mocks, and rules in a separate tranche |
| Bulk rename creates noisy failures | Medium | Execute by tranche with validation gates and commits per block |

## Rollback Strategy

- Keep migration commits small and tranche-specific
- If a tranche introduces instability, revert only that tranche commit rather than the entire migration
- Preserve config changes separately from file-renaming commits so type-config regressions can be isolated quickly

## Validation Commands

- `npm run test:unit`
- `npm run test:rules`
- `npx tsc --noEmit -p tsconfig.tests.json`
- `npm run test:e2e -- --list`
