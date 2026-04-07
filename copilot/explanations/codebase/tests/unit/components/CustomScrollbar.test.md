<!-- copilot/explanations/codebase/tests/unit/components/CustomScrollbar.test.md -->
# CustomScrollbar.test.jsx

## Overview
- **Source file:** `tests/unit/components/CustomScrollbar.test.jsx`
- **Last documented:** 2026-04-05
- **Role:** Deterministic unit coverage for global scrollbar mode class behavior in `CustomScrollbar`.

## Coverage
- Stable mode path:
  - adds `custom-scrollbar-active` + `custom-scrollbar-stable` to `html` and `body`.
  - confirms overlay class is not applied.
  - removes classes on unmount.

## Changelog
### 2026-04-07
- Refactored suite to validate stable-only scrollbar mode behavior after overlay-detection removal.

### 2026-04-05
- Added initial regression suite for scrollbar mode detection and class lifecycle behavior.
