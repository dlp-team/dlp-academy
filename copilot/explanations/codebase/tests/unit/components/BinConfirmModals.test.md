<!-- copilot/explanations/codebase/tests/unit/components/BinConfirmModals.test.md -->

# BinConfirmModals.test.jsx

## Overview
- **Source file:** `tests/unit/components/BinConfirmModals.test.jsx`
- **Role:** Unit coverage for single-item and empty-bin confirmation modal behavior.

## Changelog
### 2026-04-02
- Updated `DeleteConfirmModal` confirm-handler expectation to match current callback signature: `(targetId, itemType)`.
- Prevents false failure after typed-delete support added to modal contract.

## Validation
- Covered by focused `BinConfirmModals` test run and broad suite rerun.
