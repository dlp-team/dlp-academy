<!-- copilot/plans/todo/fix-all-playwright-e2e-tests-2026-04-16/phases/phase-03-fix-auth-tests.md -->
# Phase 3: Fix Auth Tests

**Status:** `todo`
**Tests:** 5 tests across `auth.spec.js` and `auth-onboarding.spec.js`
**Depends on:** Phase 1

---

## Tests in This Phase

| File | Test | Status | Fix |
|------|------|--------|-----|
| auth-onboarding.spec.js | register page renders required fields | ✅ PASSING | N/A |
| auth-onboarding.spec.js | existing credential can login and land on home | ❌ FAILING | Phase 1 auto-fix |
| auth.spec.js | unauthenticated user is redirected to login | ✅ PASSING | N/A |
| auth.spec.js | user can login and reach home | ❌ FAILING | Phase 1 auto-fix |
| auth.spec.js | authenticated user is redirected away from login and register | ❌ FAILING | Phase 1 auto-fix |

## Expected After Phase 1

All tests should auto-pass once email verification is fixed. The `.home-page` element exists in `Home.tsx` at line 326 and will be visible once the user reaches `/home` instead of `/verify-email`.

## Validation Checklist

- [ ] `auth-onboarding.spec.js` — 2/2 pass
- [ ] `auth.spec.js` — 3/3 pass
- [ ] `.home-page` locator resolves correctly
- [ ] Login → `/home` redirect works
- [ ] Authenticated user redirected from `/login` and `/register` to `/home`
