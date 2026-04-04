<!-- copilot/explanations/codebase/src/services/transferPromotionService.md -->
# transferPromotionService.ts

## Overview
- Source file: `src/services/transferPromotionService.ts`
- Last documented: 2026-04-04
- Role: Frontend callable wrapper for transfer/promote dry-run previews.

## Exports
- `runTransferPromotionDryRun(payload)`

## Behavior
- Calls Cloud Function `runTransferPromotionDryRun` via `httpsCallable`.
- Returns callable payload as-is when available.
- Provides deterministic fallback shape when callable returns empty data.
