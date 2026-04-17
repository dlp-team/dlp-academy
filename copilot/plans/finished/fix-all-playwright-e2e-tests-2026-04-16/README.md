<!-- copilot/plans/todo/fix-all-playwright-e2e-tests-2026-04-16/README.md -->
# Plan: Fix All Playwright E2E Tests — From 3 Passing to 75 Green

**Status:** `todo`
**Created:** 2026-04-16
**Owner:** hector
**Plan ID:** `fix-all-playwright-e2e-tests-2026-04-16`

---

## Problem Statement

The Playwright E2E test suite has **75 total tests**. Currently:
- **3 passed** (tests requiring no login)
- **29 failed** (all due to email verification redirect or UI mismatches)
- **43 skipped** (gated by env vars like `E2E_RUN_MUTATIONS`, `E2E_BIN_TESTS`, etc.)

### Root Cause Analysis

**Primary Issue — Email Verification Gate (affects 29 failing tests):**
The app's `App.tsx` (line ~190) has an email verification gate:
```tsx
if (hasPasswordProvider && !hasOnlySocialProviders && user.emailVerified === false) {
  return <Navigate to="/verify-email" />;
}
```
All E2E test accounts (owner, editor, viewer, admin, institution-admin) have **unverified emails**, causing every login to redirect to `/verify-email` instead of `/home`. This breaks all 29 tests that require login.

**Secondary Issue — Login helper `waitForURL` failures:**
Login helpers wait for `/home` URL but the app redirects to `/verify-email`, causing assertion failures before any test logic runs.

**Tertiary Issue — UI text/element mismatches (potential):**
Some admin dashboard tests reference text patterns that may not match the current UI (needs verification after fixing email issue).

## Objective

Make all 75 Playwright tests pass when run with the appropriate environment configuration.

## Phases Overview

| Phase | Description | Tests Affected |
|-------|-------------|---------------|
| 1 | Fix email verification blocking | 29 failing tests |
| 2 | Fix admin-guardrails tests | 9 tests |
| 3 | Fix auth tests | 3 tests (2 failing + 1 already passing) |
| 4 | Fix home-sharing-roles tests | 6 tests |
| 5 | Fix profile-settings tests | 3 tests |
| 6 | Fix notifications, quiz-lifecycle, subject-topic-content, user-journey, branding tests | 8 tests |
| 7 | Enable and fix mutation-gated tests | 36+ skipped tests |
| 8 | Enable and fix remaining gated tests (bin-view, study-flow, transfer-promotion) | ~7 skipped tests |
| 9 | Final validation & optimization | All 75 tests |

## Key Decisions

1. **Verify E2E emails via Playwright global setup** using Firebase Admin SDK (no app modifications)
2. **Fix login helpers** to add better timeout handling and error messages
3. **Run mutation tests** by enabling `E2E_RUN_MUTATIONS=true` during validation
4. **Fix UI selectors** to match current app text/elements
