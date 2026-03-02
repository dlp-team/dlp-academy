# Phase 02 — Auth and Onboarding Coverage Foundation (PLANNED)

## Objective

Guarantee that authentication and first-run onboarding flows work reliably across login, register, and wizard completion paths.

## Planned Changes / Actions

- Add Playwright journeys for:
  - Login with valid credentials.
  - Register flow with expected route transitions.
  - Onboarding wizard progression and completion persistence.
- Add Vitest coverage for `src/pages/Auth/hooks/useLogin.js` and `src/pages/Auth/hooks/useRegister.js`.
- Stabilize test data setup for auth users and institutions.

## Risks

- Auth providers and persistence modes can create nondeterministic behavior if fixture state is not reset.
- Onboarding wizard state may depend on pre-existing user document shape.

## Completion Criteria

- Auth and onboarding E2E tests pass with deterministic fixtures.
- Hook tests validate success/error branches and persistence writes.
- Failures and fixes are documented in working logs.
