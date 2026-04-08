<!-- copilot/explanations/codebase/tests/unit/hooks/useHomeBulkSelection.test.md -->
# useHomeBulkSelection.test.js

## Overview
- **Source file:** `tests/unit/hooks/useHomeBulkSelection.test.js`
- **Last documented:** 2026-04-08
- **Role:** Unit coverage for Home bulk-selection state transitions and de-dup semantics.

## Coverage
- Clears selection state when role/view context no longer supports selection mode.
- Removes selected ancestor folders when a child subject is selected.
- Removes selected descendant entries when a parent folder is selected.

## Changelog
### 2026-04-08
- Added focused regression coverage for folder-child selection de-dup behavior in both directions.
