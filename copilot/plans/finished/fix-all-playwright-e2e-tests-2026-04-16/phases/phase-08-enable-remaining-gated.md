<!-- copilot/plans/todo/fix-all-playwright-e2e-tests-2026-04-16/phases/phase-08-enable-remaining-gated.md -->
# Phase 8: Enable & Fix Remaining Gated Tests

**Status:** `todo`
**Tests:** ~6 tests across 2 files
**Depends on:** Phase 1

---

## bin-view.spec.js (2 tests)

**Gate:** `E2E_BIN_TESTS=true`

| Test | Description | Requirements |
|------|-------------|-------------|
| selecting a trashed card opens side panel | Click trashed item to open panel | Trashed subjects must exist |
| bin tab persists after reload | Verify `localStorage` persistence | Bin tab must be available |

**Additional runtime skips:**
- Skips if no bin tab visible (`test.skip` inside test)
- Skips if no trashed subjects exist
- Skips if "remember organization" is disabled

**Fix approach:**
1. Enable with `E2E_BIN_TESTS=true`
2. Seed a trashed subject via Admin SDK before tests
3. Verify bin tab selector matches current UI
4. Verify side panel `data-testid="bin-side-panel"` exists

## transfer-promotion.spec.js (~4 tests)

**Gates:**
- `E2E_TRANSFER_PROMOTION_TESTS=1` — Base gate
- `E2E_TRANSFER_PROMOTION_EXECUTION=1` — Execution tests
- `E2E_TRANSFER_PROMOTION_APPLY_ROLLBACK=1` — Apply/rollback tests
- `E2E_TRANSFER_PROMOTION_AUTO_SEED=1` — Auto-seed fixtures
- `E2E_TRANSFER_PROMOTION_MOCK_CALLABLES=1` — Mock callables

**Requirements:**
- `E2E_INSTITUTION_ADMIN_EMAIL` / `E2E_INSTITUTION_ADMIN_PASSWORD`
- Academic year fixtures in Firestore
- Course/class/student data for transfer/promotion operations

**Fix approach:**
1. This test suite has complex prerequisites (callable backends, academic year data)
2. Focus on enabling the base guardrails test (`E2E_TRANSFER_PROMOTION_TESTS=1`)
3. Document the full configuration needed for execution/rollback tests
4. These are the most complex tests and may need separate plan if significant issues found

## Implementation Steps

1. Run bin-view with env flag:
   ```
   $env:E2E_BIN_TESTS="true"
   npx playwright test tests/e2e/bin-view.spec.js --reporter=list
   ```
2. Run transfer-promotion with base flag:
   ```
   $env:E2E_TRANSFER_PROMOTION_TESTS="1"
   npx playwright test tests/e2e/transfer-promotion.spec.js --reporter=list
   ```
3. Fix any issues found
4. Document remaining transfer-promotion gates for future enablement

## Validation Checklist

- [ ] bin-view.spec.js — 2/2 pass (or documented runtime skip conditions)
- [ ] transfer-promotion.spec.js — base tests pass
- [ ] All env var requirements documented
