<!-- copilot/explanations/codebase/tests/unit/functions/transfer-promotion-roundtrip.test.md -->
# transfer-promotion-roundtrip.test.js

## Overview
- Source file: [tests/unit/functions/transfer-promotion-roundtrip.test.js](tests/unit/functions/transfer-promotion-roundtrip.test.js)
- Last documented: 2026-04-04
- Role: Deterministic roundtrip validation for transfer apply + rollback consistency.

## Coverage
- Executes `applyTransferPromotionPlan` and `rollbackTransferPromotionPlan` handlers against the same in-memory store.
- Verifies student profile course links (`courseId`, `courseIds`, `enrolledCourseIds`) return to pre-transfer state after rollback.
- Verifies source class membership is restored and transfer-created class/course artifacts are removed.
- Verifies rollback summary reports expected restoration/deletion counts.
