<!-- copilot/explanations/codebase/tests/unit/utils/trashRetentionUtils.test.md -->
# trashRetentionUtils.test.js

## Overview
- **Source file:** `tests/unit/utils/trashRetentionUtils.test.js`
- **Last documented:** 2026-04-02
- **Role:** Regression tests for trash-retention timestamp normalization and expiry calculations.

## Coverage
- Timestamp normalization for `Date`, Firestore `seconds`, `toDate()`, and ISO string inputs.
- Remaining-time and day-bucket computation under 15-day retention.
- Expiration detection after retention-window boundary.

## Changelog
- 2026-04-02: Added initial test suite for shared `trashRetentionUtils` helpers.
