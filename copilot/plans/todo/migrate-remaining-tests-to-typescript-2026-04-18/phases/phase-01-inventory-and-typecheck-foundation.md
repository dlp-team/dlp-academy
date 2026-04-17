<!-- copilot/plans/todo/migrate-remaining-tests-to-typescript-2026-04-18/phases/phase-01-inventory-and-typecheck-foundation.md -->
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

- [ ] File inventory captured in `working/remaining-test-file-inventory.md`
- [ ] `tsconfig.tests.json` added and usable
- [ ] `npx tsc --noEmit -p tsconfig.tests.json` runs
- [ ] No breakage to existing Vitest or Playwright config from groundwork

## Notes

This phase is the highest leverage point because the current repo does not type-check tests at all.
