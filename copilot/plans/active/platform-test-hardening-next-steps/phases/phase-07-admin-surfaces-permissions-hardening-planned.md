# Phase 07 — Admin Surfaces and Permissions Hardening (PLANNED)

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
