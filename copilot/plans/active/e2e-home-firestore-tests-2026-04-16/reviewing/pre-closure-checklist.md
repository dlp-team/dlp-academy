<!-- copilot/plans/active/e2e-home-firestore-tests-2026-04-16/reviewing/pre-closure-checklist.md -->
# Pre-Closure Checklist — E2E Home Firestore Tests

**Use this checklist before moving plan from `active` → `inReview`.**

---

## Optimization and Consolidation Review

- [ ] All repeated test patterns centralized in shared helpers
- [ ] No spec file exceeds 500 lines
- [ ] No helper file exceeds 300 lines
- [ ] All imports clean (no unused)
- [ ] No `console.log` debug statements
- [ ] `npm run lint` passes with 0 errors in tests scope
- [ ] All tests pass in single `npx playwright test` run

## Deep Risk Analysis Review

### Security & Permission Boundaries
- [ ] Test accounts don't leak credentials (env var only)
- [ ] Firebase Admin SDK service account not exposed in test output
- [ ] Tests respect multi-tenant `institutionId` boundaries

### Data Integrity & Rollback Safety
- [ ] All test-created data cleaned up after suite completion
- [ ] `e2eSeed: true` marker present on all test data for emergency cleanup
- [ ] No production data modified by tests (only test-created entities)
- [ ] Cleanup runs even when tests fail (try/finally pattern)

### Runtime Failure Modes
- [ ] Graceful skip when env vars missing (no hard failures)
- [ ] Retry logic for Firestore propagation delays
- [ ] Timeout protection for long-running operations
- [ ] No infinite loops in cleanup logic

### Unintended Real-World Behavior
- [ ] Tests don't send real emails or push notifications
- [ ] Tests don't trigger Firebase Cloud Functions side effects (or they're accounted for in cleanup)
- [ ] No accidental data deletion of non-test entities

## Final Counts

| Metric | Expected | Actual |
|--------|----------|--------|
| New spec files | 5 | — |
| New helper files | 4 | — |
| Total test cases | ~38 | — |
| Firestore collections tested | subjects, folders, notifications, shortcuts | — |
| Test accounts used | owner, editor, viewer | — |
| Orphaned docs after run | 0 | — |
