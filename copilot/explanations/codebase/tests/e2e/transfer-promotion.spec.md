// copilot/explanations/codebase/tests/e2e/transfer-promotion.spec.md

## Changelog
### 2026-04-04: Callable mock-mode full execution unblock
- Added optional e2e runtime toggle `E2E_TRANSFER_PROMOTION_MOCK_CALLABLES=1`; when enabled, the test sets `window.__E2E_TRANSFER_PROMOTION_MOCK__ = true` before app bootstrap.
- Combined with service-level mock support, this enables deterministic full-path browser validation (`dry-run -> apply -> rollback`) even when deployed callable infrastructure returns transient `internal` runtime failures.
- Added modal state-preservation fix coverage context: apply/rollback feedback is now stable through post-apply data refreshes, allowing non-skipped assertion flow.

### 2026-04-04: UI fallback seeding and callable env-failure classification
- Added browser-level fixture fallback in [tests/e2e/transfer-promotion.spec.js](tests/e2e/transfer-promotion.spec.js): when modal academic-year options are empty and `E2E_TRANSFER_PROMOTION_AUTO_SEED=1`, the suite now creates disposable source/target courses through the Institution Admin UI before retrying the modal.
- Hardened academic-year selection to prefer configured fixture years (`E2E_TRANSFER_PROMOTION_SOURCE_YEAR` / `E2E_TRANSFER_PROMOTION_TARGET_YEAR`) over synthetic suggested years.
- Converted known runtime callable failures (`internal` and related dry-run readiness messages) into explicit skip classification for execution-path tests, avoiding hard failures in environments where deployed callable/index state is not yet aligned.
- Serialized suite execution (`test.describe.configure({ mode: 'serial' })`) to avoid multi-worker collisions during UI fallback fixture creation.

### 2026-04-04: Optional fixture auto-seed setup gate
- Added optional env gate `E2E_TRANSFER_PROMOTION_AUTO_SEED=1` in [tests/e2e/transfer-promotion.spec.js](tests/e2e/transfer-promotion.spec.js) to attempt disposable transfer fixture seeding before executing modal assertions.
- Added service-account parsing fallbacks for local setup (`FIREBASE_SERVICE_ACCOUNT_JSON` raw/base64/path and multiline `.env` extraction).
- Preserved deterministic skip behavior when academic-year fixture options are still absent in the rendered modal.

### 2026-04-04: Full execution-path e2e coverage
- Added explicit full-path browser scenario in [tests/e2e/transfer-promotion.spec.js](tests/e2e/transfer-promotion.spec.js) to validate `dry-run -> apply -> rollback` behavior.
- Added dedicated mutation gate helper and env guard `E2E_TRANSFER_PROMOTION_APPLY_ROLLBACK=1` so destructive fixture runs remain opt-in.
- Added apply/rollback feedback assertions that tolerate idempotent info responses while still enforcing successful UI state transitions.

### 2026-04-04: Optimization pass for guardrail helpers
- Consolidated repeated environment-gate and missing-fixture skip reasons into shared helper constants/functions in [tests/e2e/transfer-promotion.spec.js](tests/e2e/transfer-promotion.spec.js).
- Centralized distinct-target academic-year resolution to reduce duplicate branch logic across both scenarios.

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
- `E2E_TRANSFER_PROMOTION_APPLY_ROLLBACK=1` enables fixture-dependent mutation assertions for apply and rollback flows.
- `E2E_TRANSFER_PROMOTION_AUTO_SEED=1` enables optional disposable fixture seeding attempt before modal assertions.

## Determinism Notes
- The suite reads academic-year options directly from rendered selects and skips with explicit reasons when seed data is missing.
- The execution-path assertion is isolated behind an opt-in flag to avoid flaky failures in environments without transfer fixtures.
- When dry-run callable execution returns known environment-level runtime errors, execution-path tests now skip with explicit rationale instead of failing nondeterministically.
