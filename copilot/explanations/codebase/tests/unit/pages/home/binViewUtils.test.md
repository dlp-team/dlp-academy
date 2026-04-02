<!-- copilot/explanations/codebase/tests/unit/pages/home/binViewUtils.test.md -->
# binViewUtils.test.js

## Overview
- **Source file:** `tests/unit/pages/home/binViewUtils.test.js`
- **Last documented:** 2026-04-02
- **Role:** Unit coverage for Home bin countdown and urgency helper outputs.

## Coverage
- Firestore timestamp conversion behavior in `toJsDate`.
- Remaining-ms and days-remaining retention calculations.
- Urgency class selection for red/orange/amber/emerald states.
- Bin sort-mode behavior (`urgency asc/desc`, `name A-Z/Z-A`).

## Changelog
- 2026-04-02: Added deterministic assertions for `sortBinItems` ordering across all supported sort modes.
- 2026-04-02: Confirmed helper behavior after retention math was centralized into shared `trashRetentionUtils`.
