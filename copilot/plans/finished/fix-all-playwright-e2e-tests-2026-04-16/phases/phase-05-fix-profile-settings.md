<!-- copilot/plans/todo/fix-all-playwright-e2e-tests-2026-04-16/phases/phase-05-fix-profile-settings.md -->
# Phase 5: Fix Profile & Settings Tests

**Status:** `todo`
**Tests:** 3 tests in `profile-settings.spec.js`
**Depends on:** Phase 1

---

## Tests in This Phase

| Test | Failure | Expected Fix |
|------|---------|-------------|
| profile route renders user surface and settings theme toggles work | Login redirect to `/verify-email` | Phase 1 auto-fix |
| profile edit modal opens and settings notification/view-mode controls react | Login redirect | Phase 1 auto-fix |
| settings persist after reload for theme, language, and notifications | Login redirect | Phase 1 auto-fix |

## Potential Issues After Phase 1

1. **Profile edit modal selectors** — Test uses XPath `//main//h1[1]/following-sibling::button[1]` to find edit button. This is fragile and may need updating.
2. **Notification toggles** — Section filter `hasText: /notificaciones/i` may not match current UI.
3. **Language select** — Test selects `'en'` locale; verify if app supports this.
4. **Rollback logic** — `beforeAll` saves user profile data for rollback. Verify Firebase Admin SDK access works.

## Validation Checklist

- [ ] All 3 profile-settings tests pass
- [ ] Theme toggle (dark/light) works
- [ ] Profile edit modal opens
- [ ] Settings persist after reload
- [ ] Rollback of user profile data in afterAll succeeds
