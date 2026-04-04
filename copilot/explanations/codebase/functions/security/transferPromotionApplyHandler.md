<!-- copilot/explanations/codebase/functions/security/transferPromotionApplyHandler.md -->
# transferPromotionApplyHandler.js

## Overview
- Source file: `functions/security/transferPromotionApplyHandler.js`
- Last documented: 2026-04-04
- Role: Callable handler factory that applies transfer/promote writes from dry-run payload outputs.

## Responsibilities
- Validates caller auth/role and tenant boundaries before applying writes.
- Validates dry-run payload contract and request/rollback id consistency.
- Applies planned course/class creation and student link updates in chunked batched writes.
- Applies optional class membership updates based on transfer mode/options.
- Persists rollback metadata and idempotent run state for replay protection.

## Exports
- `createApplyTransferPromotionPlanHandler({ dbInstance, serverTimestampProvider })`
