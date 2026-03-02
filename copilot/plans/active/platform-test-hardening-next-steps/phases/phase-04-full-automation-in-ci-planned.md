# Phase 04 — Full Automation in CI (PLANNED)

## Objective

Enforce automated test validation in GitHub Actions so broken changes are blocked before production.

## Planned Changes / Actions

- Add/adjust workflow steps to run unit tests and Playwright tests on push/PR.
- Configure CI prerequisites (Node version, cache, browsers, env handling).
- Define pass/fail gate behavior for branch protection readiness.

## Risks

- CI runtime instability if browser dependencies or secrets are misconfigured.
- Flaky E2E tests producing noisy failures.

## Completion Criteria

- CI executes Vitest and Playwright reliably in repository workflows.
- Failed tests return non-zero status and block merge/deploy path as configured.
- CI run instructions and troubleshooting notes are documented.
