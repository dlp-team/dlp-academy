<!-- copilot/explanations/codebase/functions/security/transferPromotionRollbackHandler.md -->
# transferPromotionRollbackHandler.js

## Changelog
### 2026-04-04: Chunked snapshot reassembly and rollback checkpoints
- Added chunked snapshot reassembly support with checksum validation when rollback docs do not include inline execution snapshots.
- Added rollback run-state transitions (`rolling_back`, `rolled_back`, `failed`) with per-chunk checkpoint records.
- Added failure metadata persistence for rollback execution errors.

## Overview
- Source file: `functions/security/transferPromotionRollbackHandler.js`
- Last documented: 2026-04-04
- Role: Callable handler factory for reversing applied transfer/promote runs using persisted rollback execution snapshots.

## Responsibilities
- Validates authenticated caller role and tenant boundaries.
- Loads rollback metadata by `rollbackId` and enforces ready-state/idempotent checks.
- Rehydrates execution snapshots from chunk subcollection docs when rollback metadata uses chunked storage mode.
- Restores student course-link snapshots and class membership snapshots.
- Deletes created class/course artifacts from the applied run.
- Marks rollback and run records as `rolled_back` with execution summary.
- Tracks rollback checkpoints and failure details for recoverability diagnostics.

## Exports
- `createRollbackTransferPromotionPlanHandler({ dbInstance, serverTimestampProvider })`
