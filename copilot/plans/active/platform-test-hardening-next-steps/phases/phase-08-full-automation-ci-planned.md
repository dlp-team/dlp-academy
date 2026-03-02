# Phase 08 — Full Automation in CI (PLANNED)

## Objective

Run unit and E2E suites automatically on push/PR to block broken changes from promotion.

## Planned Changes / Actions

- Configure GitHub Actions workflow for:
  - Node setup and dependency caching.
  - Vitest execution (`npm run test:unit`).
  - Playwright browser install and E2E execution (`npm run test:e2e`).
- Define environment handling strategy for secrets and test credentials.
- Add fail-fast quality gates for protected branches.

## Risks

- CI environment mismatch with local may create false negatives.
- E2E flakiness can reduce signal without retry/report tuning.

## Completion Criteria

- CI consistently runs and reports unit + E2E outcomes.
- Failing test runs block merge/deploy path as configured.
- Runbook notes for CI troubleshooting are documented.
