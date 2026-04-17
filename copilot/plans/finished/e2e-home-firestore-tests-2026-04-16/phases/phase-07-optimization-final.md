<!-- copilot/plans/active/e2e-home-firestore-tests-2026-04-16/phases/phase-07-optimization-final.md -->
# Phase 7: Optimization & Final Validation

**Status:** `todo`  
**Depends on:** Phases 1-6  
**Commits target:** 3-5

---

## Objectives

Mandatory final optimization phase. Centralize repeated patterns, reduce duplication, improve test reliability, and ensure full lint/validation pass across all new test files.

## Checklist

### 7.1 Centralization & DRY Audit

- [ ] Review all 5 spec files for repeated login/setup patterns → extract to helpers
- [ ] Review all cleanup patterns → ensure all use the shared `CleanupRegistry`
- [ ] Review all Firestore verification patterns → extract common assertions to helper
- [ ] Verify no inline Firebase Admin init (must use shared singleton)
- [ ] Check for duplicated selector strings → extract to constants file if 3+ uses

### 7.2 File Organization Review

- [ ] Verify no helper file exceeds 300 lines
- [ ] Verify no spec file exceeds 500 lines (split if needed)
- [ ] Ensure consistent file naming: `home-*.spec.js` for specs, `e2e-*.js` for helpers
- [ ] Verify imports are clean (no unused imports)

### 7.3 Readability & Naming

- [ ] Test descriptions are clear and descriptive in English
- [ ] Variable names follow existing E2E patterns (camelCase, descriptive)
- [ ] Comments only where behavior is non-obvious
- [ ] Consistent use of `test.describe()` grouping

### 7.4 Performance Optimization

- [ ] Review `beforeAll` vs `beforeEach` — seed shared fixtures in `beforeAll` where safe
- [ ] Batch Firestore cleanup operations (delete multiple docs in one batch)
- [ ] Minimize unnecessary `page.waitForTimeout()` calls — prefer `waitForSelector`
- [ ] Review parallelism settings — ensure mutation tests don't conflict when run in parallel

### 7.5 Reliability Improvements

- [ ] Add retry logic for flaky Firestore reads (real-time propagation delays)
- [ ] Ensure all `afterAll` cleanup runs even when tests fail (try/finally)
- [ ] Add timeouts to long-running operations (prevent test hangs)
- [ ] Verify graceful skip messages are informative when env vars missing

### 7.6 Lint & Type Validation

- [ ] Run `npm run lint` — 0 errors in `tests/e2e/` scope
- [ ] Run `npx playwright test tests/e2e/home-*.spec.js --reporter=list` — all tests pass
- [ ] Verify no `console.log` debug statements remain
- [ ] Check for TODO/FIXME comments — resolve or document

### 7.7 Final Cleanup Verification

- [ ] Run full test suite → after completion, query Firestore for `e2eSeed: true`
- [ ] Verify 0 orphaned documents remain
- [ ] Document any known edge cases in `reviewing/` folder

## Validation Gate

- [ ] All optimizations applied
- [ ] All tests pass in a single `npx playwright test` run
- [ ] `npm run lint` clean
- [ ] No orphaned data
- [ ] Commit and push completed

## Files Modified

- `tests/e2e/helpers/*.js` (optimization)
- `tests/e2e/home-*.spec.js` (DRY refactor)
