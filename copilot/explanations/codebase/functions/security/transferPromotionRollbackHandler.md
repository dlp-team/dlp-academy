<!-- copilot/explanations/codebase/functions/security/transferPromotionRollbackHandler.md -->
# transferPromotionRollbackHandler.js

## Overview
- Source file: `functions/security/transferPromotionRollbackHandler.js`
- Last documented: 2026-04-04
- Role: Callable handler factory for reversing applied transfer/promote runs using persisted rollback execution snapshots.

## Responsibilities
- Validates authenticated caller role and tenant boundaries.
- Loads rollback metadata by `rollbackId` and enforces ready-state/idempotent checks.
- Restores student course-link snapshots and class membership snapshots.
- Deletes created class/course artifacts from the applied run.
- Marks rollback and run records as `rolled_back` with execution summary.

## Exports
- `createRollbackTransferPromotionPlanHandler({ dbInstance, serverTimestampProvider })`
