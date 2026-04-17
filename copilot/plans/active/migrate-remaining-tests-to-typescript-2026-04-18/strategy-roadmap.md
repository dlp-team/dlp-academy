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
- [ ] Phase 3: Pure Logic Tests (`utils`, `services`, `functions`)
- [ ] Phase 4: Hook Tests and Non-JSX Unit Tests
- [ ] Phase 5: React Component and Page Tests (`.jsx` to `.tsx`)
- [ ] Phase 6: Final Optimization, Validation, and Documentation

## Planned Commit Cadence

- One commit for TypeScript/test config groundwork
- One commit per migration tranche where feasible
- One final documentation and cleanup commit

## Residual Follow-Ups Before Closure

- Decide whether `allowJs` should remain enabled after tests are fully migrated
- Decide whether any external mock files outside `tests/` also need TS migration in a later plan
