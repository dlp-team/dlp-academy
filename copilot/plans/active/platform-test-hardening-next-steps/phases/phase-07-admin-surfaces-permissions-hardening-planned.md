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
- Extended institution-admin positive-path assertions across dashboard surfaces:
  - Users tab checks include registered-teachers and pending-invitations section visibility.
  - Organization tab checks include create-course action visibility and classes-section render.
  - Customization tab checks include institution-name field and save action visibility.
- Added global-admin surface guardrail extensions:
  - Institution-admin explicit denial check for `/admin-dashboard`.
  - Global-admin allow-path checks for `/admin-dashboard` tabs (`Resumen`, `Instituciones`, `Usuarios`) and core section render assertions.
  - Fixture-aware skip behavior when `E2E_ADMIN_*` credentials are present but not provisioned with global-admin role in the current environment.
- Expanded permission utility unit coverage:
  - Added explicit viewer denial checks for edit/delete capabilities and UI visibility guards.
  - Added role-rank access checks for institution-admin route requirements.
  - Added role normalization/read-only/create-capability branch checks and shortcut/orphan helper checks.

## Validation Evidence

- `npm run test -- tests/unit/utils/permissionUtils.test.js` → ✅ `1` file, `12` tests passed.
- `npm run test:e2e -- tests/e2e/admin-guardrails.spec.js` → ✅ `5 passed`, ⚠️ `1 skipped` (global-admin fixture not role-provisioned in this environment).
- `npm run test:e2e -- tests/e2e/subject-topic-content.spec.js tests/e2e/quiz-lifecycle.spec.js tests/e2e/profile-settings.spec.js tests/e2e/admin-guardrails.spec.js` → ✅ `12 passed`, ⚠️ `1 skipped`.
