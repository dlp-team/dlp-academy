<!-- copilot/plans/todo/fix-all-playwright-e2e-tests-2026-04-16/phases/phase-02-fix-admin-guardrails.md -->
# Phase 2: Fix Admin Guardrails Tests

**Status:** `todo`
**Tests:** 9 tests in `admin-guardrails.spec.js`
**Depends on:** Phase 1

---

## Tests in This Phase

| # | Test | Failure Reason |
|---|------|---------------|
| 1 | owner cannot access privileged dashboard routes | `/verify-email` redirect |
| 2 | editor cannot access privileged dashboard routes | `/verify-email` redirect |
| 3 | viewer cannot access privileged dashboard routes | `/verify-email` redirect |
| 4 | institution admin can access institution dashboard tabs | Button `usuarios` not found |
| 5 | institution admin cannot access global admin dashboard | `/verify-email` redirect |
| 6 | institution admin can create and remove teacher invite | Timeout waiting for `usuarios` button |
| 7 | institution admin can save access policies | Timeout waiting for `usuarios` button |
| 8 | global admin can access admin dashboard tabs | `acceso de admin global` text not found |
| 9 | global admin can access institution-admin dashboard (inherited role) | `panel de administración` heading not found |

## Expected Fix Flow

### After Phase 1 (email verification fix):
- Tests 1-3 should auto-fix (loginAs will reach `/home`, assertRedirectedToHome works)
- Test 5 should auto-fix (institution admin redirected from `/admin-dashboard` to `/home`)
- Tests 4, 6, 7 should auto-fix if institution admin dashboard loads correctly
- Tests 8, 9 need verification — check if admin dashboard text matches test expectations

### Potential UI Text Mismatches to Verify

1. **`acceso de admin global`** — Exists in `AdminDashboard.tsx` line 619 ✅
2. **`panel de administración`** — Exists in `InstitutionAdminDashboard.tsx` line 72 ✅ and `AdminDashboard.tsx` line 613 as "Panel de Administración Global"
3. **`gráficas de actividad`** — Exists in `AdminDashboard.tsx` line 90 ✅
4. **`instituciones registradas`** — Needs verification
5. **`todos los usuarios`** — Needs verification
6. **`profesores registrados`** — Needs verification
7. **`invitaciones pendientes`** — Needs verification

## Implementation Steps

1. Run Phase 1 fix
2. Run `npx playwright test tests/e2e/admin-guardrails.spec.js --reporter=list`
3. Identify any tests still failing
4. Fix UI selectors as needed
5. Re-run until all 9 pass

## Validation Checklist

- [ ] All 9 admin-guardrails tests pass
- [ ] Role-based access denial verified (owner/editor/viewer redirected to /home)
- [ ] Institution admin dashboard tabs verified
- [ ] Global admin dashboard tabs verified
- [ ] Invite create/delete flow works
- [ ] Access policies save flow works
