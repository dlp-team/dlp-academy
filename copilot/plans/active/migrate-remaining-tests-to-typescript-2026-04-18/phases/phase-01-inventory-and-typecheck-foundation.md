<!-- copilot/plans/active/migrate-remaining-tests-to-typescript-2026-04-18/phases/phase-01-inventory-and-typecheck-foundation.md -->
# Phase 1: Inventory and Type-Check Foundation

## Objective

Create a reliable TypeScript validation path for tests before bulk renaming starts.

## Tasks

1. Inventory remaining `.js` and `.jsx` files under `tests/`
2. Create a test-focused TypeScript config, expected as `tsconfig.tests.json`
3. Ensure the config includes `tests/` and any required support files
4. Add or update a command for test-only type-checking if needed
5. Validate that current test execution still works before migrations begin

## Validation Gate

- [x] File inventory captured in `working/remaining-test-file-inventory.md`
- [x] `tsconfig.tests.json` added and usable
- [x] `npm run test:types` runs
- [x] No breakage to existing Vitest or Playwright config from groundwork

## Status: COMPLETE (2026-04-18)

## Notes

This phase established the missing test-side TypeScript validation path. The config currently targets existing `.ts` and `.tsx` test files plus `src/**`, which is sufficient for incremental tranche migration without forcing the remaining `.js` and `.jsx` files through TypeScript prematurely.

## Validation Evidence

- `npm run test:types`
- `npm run test:unit -- tests/unit/utils/stringUtils.test.js`
- `get_errors` clean on touched config, plan, and TypeScript fix files

## Implementation Notes

- Added `tsconfig.tests.json` for incremental test-side type-checking.
- Added `test:types` npm script.
- Fixed pre-existing TypeScript issues surfaced by the new command in migrated E2E files and related app typings.
- Synchronized the new plan into `active/` and cleared stale `todo/` path comments.
