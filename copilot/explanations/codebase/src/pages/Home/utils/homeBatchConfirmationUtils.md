<!-- copilot/explanations/codebase/src/pages/Home/utils/homeBatchConfirmationUtils.md -->
# homeBatchConfirmationUtils.ts

## Overview
- **Source file:** `src/pages/Home/utils/homeBatchConfirmationUtils.ts`
- **Last documented:** 2026-04-12
- **Role:** Deterministic formatter for batch confirmation preview payloads.

## Responsibilities
- Normalize batch entry type detection for subject/folder items.
- Resolve display names with safe Spanish fallback labels.
- Build preview payloads used by confirmation modals:
  - `totalCount`
  - `previewNames` (bounded to max names)
  - `overflowCount`

## Exports
- `const getBatchEntryDisplayName`
- `const buildBatchConfirmationPreview`

## Main Dependencies
- None (pure utility module).

## Changelog
- **2026-04-12:** Added initial utility implementation to centralize batch confirmation preview shaping for Home share/unshare deferred flows.
