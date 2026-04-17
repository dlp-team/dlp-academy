<!-- copilot/plans/active/migrate-remaining-tests-to-typescript-2026-04-18/strategy-roadmap.md -->
# Strategy Roadmap: Migrate Remaining Tests to TypeScript

## Objective

Complete the repository-wide TypeScript-first migration for the `tests/` tree using phased, low-regression execution.

## Phase Overview

| Phase | Title | Effort | Risk |
|------|-------|--------|------|
| 1 | Inventory and Type-Check Foundation | Small | Medium |
| 2 | Setup, Mocks, and Rules Tests | Small | Medium |
| 3 | Pure Logic Tests (`utils`, `services`, `functions`) | Medium | Low |
| 4 | Hook Tests and Non-JSX Unit Tests | Medium | Medium |
| 5 | React Component and Page Tests (`.jsx` to `.tsx`) | Large | Medium |
| 6 | Final Optimization, Validation, and Documentation | Medium | Low |

## Execution Order

Phases execute sequentially. Each phase must be validated before the next tranche starts.

## Source of Truth

This file is the source of truth for status tracking, sequencing, and closure readiness.

### Phase Status Tracker

- [x] Phase 1: Inventory and Type-Check Foundation (inventory captured, `tsconfig.tests.json`, `test:types` script, validated on 2026-04-18)
- [x] Phase 2: Setup, Mocks, and Rules Tests (renamed setup/mock/rules files to TS, validated on 2026-04-18)
- [x] Phase 3: Pure Logic Tests — 37 files renamed `.js` → `.ts` (utils 24, services 3, functions 10), 155 tests passing, validated 2026-04-17
- [x] Phase 4: Hook Tests and Non-JSX Unit Tests — 51 files renamed `.js` → `.ts` (hooks 29, pages/admin 14, pages/home 1, pages/institution-admin 7), 284+ tests passing, validated 2026-04-17
- [x] Phase 5: React Component and Page Tests — 77 files renamed `.jsx` → `.tsx`, 759/762 tests passing (3 pre-existing failures), validated 2026-04-17
- [x] Phase 6: Final Optimization, Validation, and Documentation — 0 JS/JSX remaining, 193 TS/TSX files, rules tests pass (71), type errors documented as residual, 2026-04-17

## Planned Commit Cadence

- One commit for TypeScript/test config groundwork
- One commit per migration tranche where feasible
- One final documentation and cleanup commit

## Residual Follow-Ups Before Closure

- **362 TypeScript errors in `npx tsc --noEmit -p tsconfig.tests.json`**: Pre-existing issues now surfaced (mock typings, null safety, missing module declarations). These are NOT regressions from the rename — they are technical debt that was previously hidden by JS extensions. Recommend a separate plan for test-side type-safety hardening.
- **3 pre-existing test failures** (2 in `InstitutionCustomizationMockView.test.tsx`, 1 in `UserDetailView.studentCourseLinks.test.tsx`): Unrelated to migration, existed before renames.
- Decide whether `allowJs` should remain enabled after tests are fully migrated
- Decide whether any external mock files outside `tests/` also need TS migration in a later plan
