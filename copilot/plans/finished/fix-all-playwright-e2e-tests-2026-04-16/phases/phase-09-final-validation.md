<!-- copilot/plans/todo/fix-all-playwright-e2e-tests-2026-04-16/phases/phase-09-final-validation.md -->
# Phase 9: Final Validation & Optimization

**Status:** `todo`
**Depends on:** All previous phases

---

## Final Full Suite Run

Run the complete suite with all env flags:

```powershell
$env:E2E_RUN_MUTATIONS="true"
$env:E2E_BIN_TESTS="true"
$env:E2E_TRANSFER_PROMOTION_TESTS="1"
npx playwright test --reporter=list
```

**Target:** 0 failures, 0 skipped (except runtime conditional skips for missing data)

## Optimization Tasks

### 1. Centralize Duplicated Helpers
Multiple test files define their own `ensureAdmin()`, `loginAs()`, `resolveUidByEmail()`:
- `admin-guardrails.spec.js` — inline `loginAs`, `assertRedirectedToHome`
- `home-sharing-roles.spec.js` — inline `ensureAdmin`, `resolveUidByEmail`
- `profile-settings.spec.js` — inline `ensureAdmin`
- `quiz-lifecycle.spec.js` — inline `ensureAdmin`
- `subject-topic-content.spec.js` — inline `ensureAdmin`
- `notifications.spec.js` — inline `login`

**Action:** Migrate all tests to use shared helpers from `tests/e2e/helpers/`:
- `e2e-auth-helpers.ts` (already has `login`, `loginAsOwner`, etc.)
- `e2e-firebase-admin.ts` (already has `ensureAdmin`, `resolveUidByEmail`)

### 2. Standardize Timeouts
Review and standardize timeout values across all tests:
- Login wait: 15000ms (currently varies from 5000-15000ms)
- Element visibility: 10000ms (currently varies from 5000-15000ms)
- Form submission: 10000ms

### 3. Add `data-testid` Attributes
Where tests use fragile selectors (XPath, text matching), add `data-testid` attributes to components for stable targeting. Priority areas:
- Notification bell button
- Profile edit button
- Admin dashboard tabs
- Theme toggle buttons

### 4. Environment Variable Documentation
Create `tests/e2e/README.md` documenting:
- All required env vars per test category
- How to run specific test subsets
- Cleanup and seeding information
- CI/CD configuration guidance

## Validation Checklist

- [ ] Full suite runs with 0 failures
- [ ] Duplicated helpers identified and migration plan created
- [ ] Timeout review completed
- [ ] Environment documentation created
- [ ] No orphaned test data in Firestore after full run
