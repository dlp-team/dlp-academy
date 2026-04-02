<!-- copilot/explanations/codebase/tests/unit/utils/academicYearLifecycleUtils.test.md -->

## Overview
Covers deterministic behavior for `academicYearLifecycleUtils`:
- current academic-year resolution,
- current vs ended classification,
- role-aware ended badge mapping,
- pass-state inference from grade data.

## Changelog
### 2026-04-02: Initial lifecycle utility coverage
- Added tests for Jul-Dec / Jan-Jun current-year boundaries.
- Added tests for legacy-year fallback handling in current/ended classification.
- Added badge-style assertions for teacher (yellow) and student red-to-green score mapping.
- Added pass-state inference checks from numeric grade values.

## Validation
- `npm run test -- tests/unit/utils/academicYearLifecycleUtils.test.js`
