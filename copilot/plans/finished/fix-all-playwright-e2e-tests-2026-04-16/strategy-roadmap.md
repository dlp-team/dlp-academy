<!-- copilot/plans/todo/fix-all-playwright-e2e-tests-2026-04-16/strategy-roadmap.md -->
# Strategy Roadmap — Fix All Playwright E2E Tests

**Source of Truth** for phased execution.

---

## Current State (2026-04-16)

| Metric | Value |
|--------|-------|
| Total tests | 75 |
| Passing | 3 |
| Failing | 29 |
| Skipped | 43 |
| Target | 75 passing (with proper env flags) |

## Test Inventory by File

| File | Total | Status | Root Cause |
|------|-------|--------|------------|
| admin-guardrails.spec.js | 9 | 9 FAILING | Email verify redirect + UI mismatches |
| auth-onboarding.spec.js | 2 | 1 PASS / 1 FAILING | Email verify redirect |
| auth.spec.js | 3 | 1 PASS / 2 FAILING | Email verify redirect |
| bin-view.spec.js | 2 | 2 SKIPPED | `E2E_BIN_TESTS=true` gate |
| branding.spec.js | 1 | 1 SKIPPED | Email verify redirect at login |
| home-advanced-operations.spec.ts | 7 | 7 SKIPPED | `E2E_RUN_MUTATIONS=true` gate |
| home-bulk-operations.spec.ts | 6 | 6 SKIPPED | `E2E_RUN_MUTATIONS=true` gate |
| home-folder-crud.spec.ts | 8 | 8 SKIPPED | `E2E_RUN_MUTATIONS=true` gate |
| home-sharing-operations.spec.ts | 9 | 9 SKIPPED | `E2E_RUN_MUTATIONS=true` gate |
| home-sharing-roles.spec.js | 6 | 6 FAILING | Email verify redirect |
| home-subject-crud.spec.ts | 6 | 6 SKIPPED | `E2E_RUN_MUTATIONS=true` gate |
| notifications.spec.js | 1 | 1 FAILING | Email verify redirect |
| profile-settings.spec.js | 3 | 3 FAILING | Email verify redirect |
| quiz-lifecycle.spec.js | 3 | 3 FAILING | Email verify redirect |
| study-flow.spec.js | 1 | 1 SKIPPED | `E2E_RUN_MUTATIONS=true` gate |
| subject-topic-content.spec.js | 3 | 3 FAILING | Email verify redirect + UI mismatches |
| transfer-promotion.spec.js | ~4 | SKIPPED | Multiple special gates |
| user-journey.spec.js | 1 | 1 FAILING | Email verify redirect |

## Execution Strategy

### Phase 1: Fix Email Verification Blocking (CRITICAL PATH)
**Impact: Unblocks 29 failing tests**

Create a Playwright `globalSetup` script that uses Firebase Admin SDK to:
1. Resolve UIDs for all E2E test accounts
2. Call `admin.auth().updateUser(uid, { emailVerified: true })` for each
3. Run before every test suite

Files to create:
- `tests/e2e/global-setup.ts` — Playwright global setup

Files to modify:
- `playwright.config.js` — Add `globalSetup` reference

### Phase 2: Fix Admin Guardrails Tests
**9 tests**

After email verification fix, verify if admin tests pass. If not, fix:
- UI text mismatches (e.g., `acceso de admin global`, `panel de administración`)
- Timeout issues on institution admin dashboard
- Tab button locators

### Phase 3: Fix Auth Tests
**3 tests (2 failing → passing)**

After email verification fix, these should pass. Validate:
- Login → `/home` redirect works
- `.home-page` element is visible
- Authenticated redirect from `/login` and `/register`

### Phase 4: Fix Home Sharing Roles Tests
**6 tests**

After email verification fix, validate:
- All login flows reach `.home-page`
- Shared tab rendering
- Editor/viewer permission assertions

### Phase 5: Fix Profile & Settings Tests
**3 tests**

After email verification fix, validate:
- Profile route rendering
- Settings theme toggle
- Edit modal functionality

### Phase 6: Fix Remaining Failing Tests
**8 tests across notifications, quiz-lifecycle, subject-topic-content, user-journey, branding**

After email verification fix:
- Validate quiz lifecycle seeding + navigation
- Validate subject-topic content navigation
- Validate notifications button locator
- Validate branding customization flow
- Validate user journey end-to-end

### Phase 7: Enable & Fix Mutation-Gated Tests
**36+ skipped tests**

Run with `E2E_RUN_MUTATIONS=true` and validate:
- home-subject-crud.spec.ts (6 tests)
- home-folder-crud.spec.ts (8 tests)
- home-sharing-operations.spec.ts (9 tests)
- home-bulk-operations.spec.ts (6 tests)
- home-advanced-operations.spec.ts (7 tests)
- study-flow.spec.js (1 test)

Fix any UI mismatches or test logic issues.

### Phase 8: Enable & Fix Remaining Gated Tests
**~7 skipped tests**

- bin-view.spec.js (2 tests) — enable with `E2E_BIN_TESTS=true`
- transfer-promotion.spec.js (~4 tests) — enable with various flags

### Phase 9: Final Validation & Optimization
- Run full suite with all env flags enabled
- Verify 0 failures
- Centralize duplicated test helpers
- Optimize test timeouts
- Document env configuration requirements

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Email verification fix might break existing flows | Low | Only modifies e2e user accounts, not app code |
| Mutation tests modify live Firestore data | Medium | Tests use cleanup registry; run in isolation |
| Admin UI text has changed since tests were written | Medium | Phase 2 verifies and updates selectors |
| Transfer-promotion tests need special backend setup | High | Document prerequisites clearly |

## Success Criteria

- [ ] All 75 tests pass when run with proper env flags
- [ ] `npx playwright test --reporter=list` shows 0 failures
- [ ] Documentation updated with required env vars for each test category
