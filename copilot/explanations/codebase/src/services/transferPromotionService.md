<!-- copilot/explanations/codebase/src/services/transferPromotionService.md -->
# transferPromotionService.ts

## Overview
- Source file: `src/services/transferPromotionService.ts`
- Last documented: 2026-04-04
- Role: Frontend callable wrapper for transfer/promote dry-run previews.

## Exports
- `runTransferPromotionDryRun(payload)`
- `applyTransferPromotionPlan({ dryRunPayload, mappings, rollbackMetadata })`
- `rollbackTransferPromotionPlan({ rollbackId, institutionId })`

## Behavior
- Calls Cloud Function `runTransferPromotionDryRun` via `httpsCallable`.
- Calls Cloud Function `applyTransferPromotionPlan` via `httpsCallable`.
- Calls Cloud Function `rollbackTransferPromotionPlan` via `httpsCallable`.
- Returns callable payload as-is when available.
- Provides deterministic fallback shapes when callable returns empty data.

## Changelog
### 2026-04-04
- Added opt-in e2e callable mock mode to unblock deterministic browser execution-path validation when deployed callable infrastructure is unstable.
- Mock mode activation paths:
	- runtime flag: `window.__E2E_TRANSFER_PROMOTION_MOCK__ = true`
	- build/env flag: `VITE_E2E_TRANSFER_PROMOTION_MOCK=1`
- When enabled, `runTransferPromotionDryRun`, `applyTransferPromotionPlan`, and `rollbackTransferPromotionPlan` return deterministic synthetic payloads compatible with existing UI workflow expectations.
