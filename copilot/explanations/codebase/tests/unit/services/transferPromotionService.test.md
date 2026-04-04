<!-- copilot/explanations/codebase/tests/unit/services/transferPromotionService.test.md -->
# transferPromotionService.test.js

## Overview
- Source file: `tests/unit/services/transferPromotionService.test.js`
- Last documented: 2026-04-04
- Role: Verifies callable wiring and fallback behavior for transfer/promotion dry-run frontend service.

## Coverage
- Asserts `runTransferPromotionDryRun` callable name and payload delegation.
- Asserts deterministic default response shape when callable returns empty payload.
- Asserts `applyTransferPromotionPlan` callable name and payload delegation.
- Asserts `rollbackTransferPromotionPlan` callable name/payload delegation and fallback response shape.
