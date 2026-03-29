# Phase 07 — Admin Surfaces and Permissions Hardening (COMPLETED)

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
  - Runtime fallback skips removed; allow-path now asserts deterministic `/admin-dashboard` access and tab visibility when `E2E_ADMIN_*` credentials are configured.
- Added institution-admin mutation-path regression coverage on users tab:
  - Invite lifecycle: create teacher invite from `Autorizar Profesor` modal and delete it from `Invitaciones Pendientes`.
  - Institutional code lifecycle: update `Código General para Profesores`, assert in-app success, and restore prior code within test cleanup.
- Extended denial-path hardening for non-admin fixtures (`owner`, `editor`, `viewer`):
  - After blocked navigation to `/institution-admin-dashboard`, assert mutation controls are absent (`Autorizar Profesor`, `#instCodeInput`).
- Extended denial-path coverage for nested institution-admin routes:
  - Owner/editor/viewer denied for `/institution-admin-dashboard/teacher/:id` and `/institution-admin-dashboard/student/:id` (redirect to `/home`).
- Added inherited-access role check for global-admin credentials on institution-admin surface:
  - Global admin can access `/institution-admin-dashboard` through role-rank inheritance and route guard compatibility.
- Expanded permission utility unit coverage:
  - Added explicit viewer denial checks for edit/delete capabilities and UI visibility guards.
  - Added role-rank access checks for institution-admin route requirements.
  - Added role normalization/read-only/create-capability branch checks and shortcut/orphan helper checks.

## Validation Evidence

- `npm run test -- tests/unit/utils/permissionUtils.test.js` → ✅ `1` file, `12` tests passed.
- `npm run test -- tests/unit/utils/permissionUtils.test.js` (teacher route-rank assertions added) → ✅ `1` file, `13` tests passed.
- `npm run test:e2e -- tests/e2e/admin-guardrails.spec.js` → ✅ `8 passed`, `0 skipped`.
- `npm run test:e2e -- tests/e2e/admin-guardrails.spec.js` (after non-admin mutation-denial assertions) → ✅ `8 passed`, `0 skipped`.
- `npm run test:e2e -- tests/e2e/admin-guardrails.spec.js` (nested-route denials + inherited admin-role access) → ✅ `9 passed`, `0 skipped`.
- `npm run test:e2e -- tests/e2e/subject-topic-content.spec.js tests/e2e/quiz-lifecycle.spec.js tests/e2e/profile-settings.spec.js tests/e2e/admin-guardrails.spec.js` → ✅ `12 passed`, ⚠️ `1 skipped`.
- `npm run test:e2e -- tests/e2e/subject-topic-content.spec.js tests/e2e/quiz-lifecycle.spec.js tests/e2e/profile-settings.spec.js tests/e2e/admin-guardrails.spec.js` (post-dashboard updates) → ✅ `15 passed`, `0 skipped`.
- `npm run test:e2e -- tests/e2e/subject-topic-content.spec.js tests/e2e/quiz-lifecycle.spec.js tests/e2e/profile-settings.spec.js tests/e2e/admin-guardrails.spec.js` (Phase 07 closure run) → ✅ `16 passed`, `0 skipped`.
