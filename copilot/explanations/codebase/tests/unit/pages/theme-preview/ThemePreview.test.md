<!-- copilot/explanations/codebase/tests/unit/pages/theme-preview/ThemePreview.test.md -->
# ThemePreview.test.jsx

## Overview
- **Source file:** `tests/unit/pages/theme-preview/ThemePreview.test.jsx`
- **Last documented:** 2026-04-08
- **Role:** Deterministic unit coverage for the public `theme-preview` route message-consumption behavior.

## Coverage
- Query-param role bootstrap (`teacher` / `student`) on initial route load.
- Same-origin preview `postMessage` handling for role and live color updates.
- Foreign-origin message rejection to preserve message-boundary safety.

## Changelog
### 2026-04-08
- Added initial test suite for the new `theme-preview` route.
- Added role-param bootstrap assertion.
- Added postMessage-driven live role/color update assertion.
- Added foreign-origin message rejection assertion.
