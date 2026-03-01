# Phase 01 — Smoke Test Baseline (PLANNED)

## Objective

Confirm that unit and E2E test engines run reliably in the current local environment.

## Planned Changes / Actions

- Run `npm run test:unit` (or `npx vitest`) and resolve immediate path/config issues.
- Run `npx playwright test --ui` and verify browser automation can reach `http://localhost:5173`.
- Capture pass/fail summary and instability signals.

## Risks

- Local environment drift (missing env vars, dev server not available).
- False failures caused by unstable selectors or timing.

## Completion Criteria

- Unit suite executes with no unresolved infrastructure/config errors.
- Playwright UI opens and can execute baseline tests against the app.
- Smoke outcomes documented in `working/smoke-log-2026-03-01.md`.
