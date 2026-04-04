<!-- copilot/explanations/codebase/tests/unit/functions/transfer-promotion-apply-handler.test.md -->
# transfer-promotion-apply-handler.test.js

## Overview
- Source file: `tests/unit/functions/transfer-promotion-apply-handler.test.js`
- Last documented: 2026-04-04
- Role: Deterministic coverage for transfer/promotion apply callable write execution and idempotency behavior.

## Coverage
- Validates successful apply flow writes planned course/class/student updates plus rollback/run metadata.
- Validates idempotent re-apply short-circuit when run record is already in `applied` status.
