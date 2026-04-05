<!-- copilot/explanations/codebase/tests/unit/functions/transfer-promotion-dry-run-handler.test.md -->
# transfer-promotion-dry-run-handler.test.js

## Overview
- Source file: `tests/unit/functions/transfer-promotion-dry-run-handler.test.js`
- Last documented: 2026-04-05
- Role: Deterministic unit coverage for transfer/promote dry-run callable handler.

## Coverage
- Denies dry-run attempts when institution-level transfer/promotion automation is disabled.
- Denies institution-admin dry-run attempts outside owned institution.
- Validates `mode = promote` course mappings use configured hierarchy order to resolve destination course names.
- Validates successful promote dry-run mapping output and rollback metadata generation.
