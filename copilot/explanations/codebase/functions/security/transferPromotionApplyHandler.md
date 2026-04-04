<!-- copilot/explanations/codebase/functions/security/transferPromotionApplyHandler.md -->
# transferPromotionApplyHandler.js

## Changelog
### 2026-04-04: Checkpointed apply-state and chunked snapshot persistence
- Added staged run-state transitions (`pending -> applying -> applied/failed`) with deterministic failure metadata.
- Added per-chunk checkpoint writes under `transferPromotionRuns/{requestId}/checkpoints/{chunkIndex}`.
- Added snapshot persistence planning via `transferPromotionSnapshotUtils` with inline/chunked storage modes and checksum metadata.

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
- Persists execution snapshots (created entity ids + pre-apply student/class states) with inline/chunked storage fallback and checksum metadata.
- Records per-chunk apply checkpoints and failure markers to support recoverability and post-failure inspection.

## Exports
- `createApplyTransferPromotionPlanHandler({ dbInstance, serverTimestampProvider, snapshotInlineEntryLimit, snapshotChunkSize })`
