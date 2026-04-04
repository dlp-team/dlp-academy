// copilot/explanations/codebase/tests/e2e/transfer-promotion.spec.md

## Changelog
### 2026-04-04: Transfer/promotion modal guardrails coverage
- Added browser-level e2e guardrails in [tests/e2e/transfer-promotion.spec.js](tests/e2e/transfer-promotion.spec.js) for institution-admin transfer/promotion modal behavior.
- Locked deterministic pre-execution validation that keeps `Ejecutar simulación` disabled when source and target academic years are equal.
- Added optional dry-run summary assertions behind explicit fixture gate `E2E_TRANSFER_PROMOTION_EXECUTION=1`.

## Overview
This suite validates transfer/promotion modal behavior in Institution Admin organization flow with explicit environment gates.

## Execution Gates
- `E2E_TRANSFER_PROMOTION_TESTS=1` enables modal guardrail scenarios.
- `E2E_INSTITUTION_ADMIN_EMAIL` and `E2E_INSTITUTION_ADMIN_PASSWORD` are required for login.
- `E2E_TRANSFER_PROMOTION_EXECUTION=1` enables fixture-dependent dry-run execution assertions.

## Determinism Notes
- The suite reads academic-year options directly from rendered selects and skips with explicit reasons when seed data is missing.
- The execution-path assertion is isolated behind an opt-in flag to avoid flaky failures in environments without transfer fixtures.
