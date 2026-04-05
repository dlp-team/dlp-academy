<!-- copilot/explanations/codebase/tests/unit/functions/transfer-promotion-apply-handler.test.md -->
# transfer-promotion-apply-handler.test.js

## Changelog
### 2026-04-05: Institution automation toggle deny-path coverage
- Added coverage that rejects apply execution when `institutions/{institutionId}.automationSettings.transferPromotionEnabled` is false.

### 2026-04-04: Recoverability and chunked snapshot coverage
- Added failure-path coverage that forces apply commit errors and verifies run status transitions to `failed` with failure code metadata.
- Added chunked snapshot persistence coverage (`snapshotStorageMode = chunked`) with deterministic chunk-document assertions.

## Overview
- Source file: `tests/unit/functions/transfer-promotion-apply-handler.test.js`
- Last documented: 2026-04-05
- Role: Deterministic coverage for transfer/promotion apply callable write execution and idempotency behavior.

## Coverage
- Validates successful apply flow writes planned course/class/student updates plus rollback/run metadata.
- Validates disabled institution automation toggle blocks apply execution before write orchestration.
- Validates idempotent re-apply short-circuit when run record is already in `applied` status.
- Validates apply failure-state persistence when a chunk commit throws.
- Validates chunked rollback snapshot persistence path and chunk metadata writes.
