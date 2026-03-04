# Phase 07 — Admin Surfaces and Permissions Hardening (IN_PROGRESS)

## Objective

Ensure admin surfaces and role permissions are protected against unauthorized access and action leaks.

## Planned Changes / Actions

- Add Playwright journeys for:
  - Institution admin dashboard tabs (users, organization, customization).
  - Teacher/admin dashboard route guards and role-based redirects.
- Expand Vitest coverage for permission and role utilities:
  - `src/utils/permissionUtils.js`
  - Related role guard logic used by protected routes.
- Add negative-path tests proving viewers cannot enter edit/share/delete state.

## Risks

- Role and sharing combinations can create hidden privilege-escalation paths.
- Dashboard tab complexity may require robust test fixtures.

## Completion Criteria

- Admin E2E tests pass for allowed roles and fail/redirect for disallowed roles.
- Permission unit tests include explicit viewer denial scenarios.
- No unauthorized edit action is reachable by regression.

## Execution Notes

- Added new Phase 07 E2E suite:
  - `tests/e2e/admin-guardrails.spec.js`
- Implemented route-guard negative-path checks for non-admin roles:
  - Owner denied for `/admin-dashboard` and `/institution-admin-dashboard` (redirect to `/home`).
  - Editor denied for `/admin-dashboard` and `/institution-admin-dashboard` (redirect to `/home`).
  - Viewer denied for `/admin-dashboard` and `/institution-admin-dashboard` (redirect to `/home`).
- Added optional institution-admin allow-path check (env-gated):
  - Verifies access to institution admin dashboard and primary tabs when institution-admin credentials are provided.
- Expanded permission utility unit coverage:
  - Added explicit viewer denial checks for edit/delete capabilities and UI visibility guards.
  - Added role-rank access checks for institution-admin route requirements.

## Validation Evidence

- `npm run test:unit -- tests/unit/utils/permissionUtils.test.js` → ✅ `1` file, `8` tests passed.
- `npm run test:e2e -- tests/e2e/admin-guardrails.spec.js` → ✅ `4 passed`.
- `npm run test:e2e -- tests/e2e/subject-topic-content.spec.js tests/e2e/quiz-lifecycle.spec.js tests/e2e/profile-settings.spec.js tests/e2e/admin-guardrails.spec.js` → ✅ `11 passed`.
