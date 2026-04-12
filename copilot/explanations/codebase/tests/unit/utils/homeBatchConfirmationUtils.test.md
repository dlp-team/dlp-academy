<!-- copilot/explanations/codebase/tests/unit/utils/homeBatchConfirmationUtils.test.md -->
# homeBatchConfirmationUtils.test.js

## Overview
- **Source file:** `tests/unit/utils/homeBatchConfirmationUtils.test.js`
- **Last documented:** 2026-04-12
- **Role:** Unit coverage for deterministic batch confirmation preview formatting.

## Covered Scenarios
- Returns all names when selection size is <= 5.
- Returns first five names plus overflow count when selection size is > 5.
- Uses type-specific fallback labels when entries do not include names.

## Related Runtime Surface
- `src/pages/Home/utils/homeBatchConfirmationUtils.ts`
- `src/pages/Home/hooks/useHomeBulkSelection.ts`
- `src/pages/Home/components/HomeShareConfirmModals.tsx`

## Changelog
- **2026-04-12:** Added initial suite for Phase 02 batch confirmation preview payload behavior.
