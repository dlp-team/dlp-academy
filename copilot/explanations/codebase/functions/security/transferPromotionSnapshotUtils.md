<!-- copilot/explanations/codebase/functions/security/transferPromotionSnapshotUtils.md -->
# transferPromotionSnapshotUtils.js

## Overview
- Source file: `functions/security/transferPromotionSnapshotUtils.js`
- Last documented: 2026-04-04
- Role: Shared snapshot normalization, checksum, and persistence-planning utility for transfer apply/rollback handlers.

## Responsibilities
- Normalizes transfer execution snapshots into deterministic shapes.
- Computes snapshot entry counts and checksum signatures.
- Builds inline vs chunked persistence plans based on configurable thresholds.
- Rebuilds normalized execution snapshots from chunk documents in deterministic order.

## Exports
- `TRANSFER_SNAPSHOT_SCHEMA_VERSION`
- `TRANSFER_SNAPSHOT_INLINE_ENTRY_LIMIT`
- `TRANSFER_SNAPSHOT_CHUNK_SIZE`
- `normalizeExecutionSnapshot(snapshot)`
- `getExecutionSnapshotEntryCount(executionSnapshot)`
- `buildExecutionSnapshotChecksum(executionSnapshot)`
- `buildSnapshotPersistencePlan({ executionSnapshot, inlineEntryLimit, chunkSize })`
- `rebuildExecutionSnapshotFromChunks({ baseSnapshot, chunkDocs })`
