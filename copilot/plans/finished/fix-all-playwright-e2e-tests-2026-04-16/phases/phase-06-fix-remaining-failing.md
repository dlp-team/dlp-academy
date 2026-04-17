<!-- copilot/plans/todo/fix-all-playwright-e2e-tests-2026-04-16/phases/phase-06-fix-remaining-failing.md -->
# Phase 6: Fix Remaining Failing Tests

**Status:** `todo`
**Tests:** 8 tests across 5 files
**Depends on:** Phase 1

---

## Tests in This Phase

### notifications.spec.js (1 test)
| Test | Failure | Notes |
|------|---------|-------|
| opens notifications history route from panel full-history action | `getByTitle(/mailbox/i)` not found | Login redirect + possibly changed icon attribute |

**Potential fix:** After Phase 1 login fix, verify notification bell uses `title="mailbox"` attribute. May need to change to a different locator (data-testid, aria-label, etc.).

### quiz-lifecycle.spec.js (3 tests)
| Test | Failure | Notes |
|------|---------|-------|
| user can open quiz, complete it, and return to topic | Timeout on `getByRole('button', { name: /comenzar test/i })` | Login fix + quiz seeding must work |
| quiz completion persists result for current user | Same timeout | Same |
| quiz failing score renders retry flow | Same timeout | Same |

**Dependencies:** Requires valid `E2E_SUBJECT_ID`, `E2E_TOPIC_ID`, and Firestore quiz seed data via Admin SDK.

### subject-topic-content.spec.js (3 tests)
| Test | Failure | Notes |
|------|---------|-------|
| subject route renders and topic surface is reachable | `getByPlaceholder('Buscar tema o número...')` not found | Login fix + placeholder text may have changed |
| study guide editor save action keeps editor state | `getByRole('button', { name: /guardar/i })` not found | Login fix + editor UI may have changed |
| invalid resource route shows controlled fallback | `getByText(/contenido no disponible/i)` not found | Login fix + fallback text may have changed |

**Potential fixes:**
- Verify search placeholder text in current UI
- Verify save button text in study guide editor
- Verify fallback text for invalid resource routes

### user-journey.spec.js (1 test)
| Test | Failure | Notes |
|------|---------|-------|
| home → subject → profile → settings theme works | `.home-page` not found | Phase 1 auto-fix |

### branding.spec.js (1 test — currently skipped at describe-level)
| Test | Failure | Notes |
|------|---------|-------|
| admin can update branding form fields | Skipped (needs E2E_EMAIL credentials) | After Phase 1, login should work; may need institution admin role |

## Implementation Steps

1. After Phase 1, run each file individually:
   ```
   npx playwright test tests/e2e/notifications.spec.js --reporter=list
   npx playwright test tests/e2e/quiz-lifecycle.spec.js --reporter=list
   npx playwright test tests/e2e/subject-topic-content.spec.js --reporter=list
   npx playwright test tests/e2e/user-journey.spec.js --reporter=list
   npx playwright test tests/e2e/branding.spec.js --reporter=list
   ```
2. For each failure, check the actual UI element text/attributes
3. Update test selectors to match current UI
4. Verify seeding logic works for quiz and subject-topic tests

## Validation Checklist

- [ ] notifications.spec.js — 1/1 pass
- [ ] quiz-lifecycle.spec.js — 3/3 pass
- [ ] subject-topic-content.spec.js — 3/3 pass
- [ ] user-journey.spec.js — 1/1 pass
- [ ] branding.spec.js — 1/1 pass (or documented skip reason)
