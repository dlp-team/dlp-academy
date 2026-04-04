<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/student-course-linking-and-transfer-subplan.md -->
# Student-Course Linking and Transfer Subplan

## Objective
Complete the remaining Phase 05 transfer hardening work by making transfer apply/rollback recoverable at large scale and validating full execution-path behavior in fixture-backed browser flows.

## Scope Slice
- Expand operational validation of transfer modal execution path (`dry-run -> apply -> rollback`) in a seeded disposable environment.
- Redesign rollback snapshot persistence to avoid Firestore document-size overflow in large institutions.
- Add checkpointed apply-state progression so partial failures are resumable and observable.

## Constraints
- Preserve strict tenant isolation (`institutionId`) for all callable reads/writes.
- Keep existing callable contracts backward compatible for current UI clients.
- Do not weaken idempotency guarantees for `requestId` and `rollbackId`.
- Avoid non-deterministic retries; all recovery state must be explicit and queryable.

## Data Model Impact
- Keep root rollback metadata in `transferPromotionRollbacks/{rollbackId}`.
- Add chunk subcollection `transferPromotionRollbacks/{rollbackId}/snapshotChunks/{chunkId}` with deterministic chunk ordering fields.
- Root rollback document stores:
  - `snapshotSchemaVersion`,
  - `snapshotChunkCount`,
  - `snapshotChecksum`,
  - `snapshotStorageMode` (`inline` or `chunked`).
- Add run-state fields to `transferPromotionRuns/{requestId}`:
  - `status`: `pending | applying | applied | failed | rollingBack | rolledBack`,
  - `lastCompletedChunkIndex`,
  - `failureCode`,
  - `failureMessage`.
- Add checkpoint subcollection `transferPromotionRuns/{requestId}/checkpoints/{chunkIndex}` to track deterministic chunk completion.

## Execution Architecture
1. Build transfer execution snapshot in memory and estimate payload size.
2. If snapshot exceeds safe threshold, split by deterministic chunk key and persist in `snapshotChunks`.
3. Mark run status `applying` before first mutation batch.
4. For each apply chunk:
   - write checkpoint intent,
   - execute batch,
   - mark checkpoint complete,
   - update run `lastCompletedChunkIndex`.
5. On failure, persist `failed` state with deterministic error code/message and keep completed checkpoint history for resume or rollback.
6. Rollback reads inline snapshot when present; otherwise reassembles chunked snapshot in order and executes inverse operations with the same checkpoint discipline.

## Backward Compatibility Strategy
- Read path supports both legacy inline snapshot shape and new chunked storage mode.
- Existing rollback docs without schema version remain valid through legacy adapter branch.
- Callable response payload keeps current top-level keys (`success`, `rollbackId`, `requestId`, `warnings`) unchanged.

## Validation Strategy
- Unit tests for:
  - chunk split/reassembly integrity and checksum mismatch handling,
  - legacy inline snapshot compatibility,
  - staged status transitions (`pending -> applying -> applied` and failure branches).
- Handler tests for:
  - mid-chunk failure and resumable apply path,
  - rollback after partial apply,
  - idempotent re-entry with existing checkpoints.
- Browser e2e evidence run with:
  - `E2E_TRANSFER_PROMOTION_TESTS=1`,
  - `E2E_TRANSFER_PROMOTION_EXECUTION=1`,
  - `E2E_TRANSFER_PROMOTION_APPLY_ROLLBACK=1`.

## Rollback Notes
- Schema remains additive: if rollout fails, disable chunked mode flag and continue serving legacy inline snapshot reads.
- Keep migration helper to backfill chunk metadata for already-created rollback documents only when explicitly invoked.
- Preserve previous callable permissions and tenant guards unchanged.

## Progress Update (2026-04-04)
- Implemented chunk planning + checksum helpers in [functions/security/transferPromotionSnapshotUtils.js](functions/security/transferPromotionSnapshotUtils.js).
- Implemented chunked snapshot persistence with inline fallback in [functions/security/transferPromotionApplyHandler.js](functions/security/transferPromotionApplyHandler.js).
- Implemented checkpointed apply state transitions (`pending`, `applying`, `applied`, `failed`) and per-chunk checkpoint documents.
- Implemented rollback reassembly for chunked snapshots plus rollback checkpoint tracking in [functions/security/transferPromotionRollbackHandler.js](functions/security/transferPromotionRollbackHandler.js).
- Added deterministic coverage in:
  - [tests/unit/functions/transfer-promotion-snapshot-utils.test.js](tests/unit/functions/transfer-promotion-snapshot-utils.test.js)
  - [tests/unit/functions/transfer-promotion-apply-handler.test.js](tests/unit/functions/transfer-promotion-apply-handler.test.js)
  - [tests/unit/functions/transfer-promotion-rollback-handler.test.js](tests/unit/functions/transfer-promotion-rollback-handler.test.js)
- Added large-snapshot stress test assertions for chunk metadata stability and checksum parity in [tests/unit/functions/transfer-promotion-snapshot-utils.test.js](tests/unit/functions/transfer-promotion-snapshot-utils.test.js).

## Status
- CORE_IMPLEMENTATION_COMPLETE (2026-04-04)
- UNIT_STRESS_VALIDATION_COMPLETE (2026-04-04)
- REMAINING: fixture-backed e2e execution evidence with seeded disposable data