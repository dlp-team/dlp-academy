<!-- copilot/plans/todo/migrate-remaining-tests-to-typescript-2026-04-18/phases/phase-04-hooks-and-non-jsx-unit-tests.md -->
# Phase 4: Hook Tests and Non-JSX Unit Tests

## Objective

Migrate hook-heavy tests and other non-JSX unit tests that may rely on typed mocks, timers, browser APIs, or custom render helpers.

## Scope

- `tests/unit/hooks/**`
- non-JSX page/helper tests outside the pure-logic tranche

## Tasks

1. Rename eligible non-JSX tests from `.js` to `.ts`
2. Fix browser/mock typings only where required
3. Validate affected hook suites
4. Capture recurring migration patterns for later JSX/TSX work

## Validation Gate

- [ ] Hook test files migrated cleanly
- [ ] No new runtime failures from typed mocks or globals
- [ ] Targeted test suites pass
