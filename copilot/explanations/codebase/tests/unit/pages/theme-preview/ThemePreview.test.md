<!-- copilot/explanations/codebase/tests/unit/pages/theme-preview/ThemePreview.test.md -->
# ThemePreview.test.jsx

## Overview
- **Source file:** `tests/unit/pages/theme-preview/ThemePreview.test.jsx`
- **Last documented:** 2026-04-08
- **Role:** Deterministic unit coverage for the public `theme-preview` route message-consumption behavior.

## Coverage
- Query-param role bootstrap (`teacher` / `student`) on initial route load.
- Same-origin preview `postMessage` handling for role, sanitized preview-user context, and live style-tag updates.
- Foreign-origin message rejection to preserve message-boundary safety.

## Changelog
### 2026-04-10
- Reworked suite to match real-Home preview route architecture using a mocked `Home` surface.
- Added assertions for message-delivered user-context bootstrap and role-forced rendering.
- Added assertions for runtime theme/highlight style-tag injection in route document head.

### 2026-04-08
- Added initial test suite for the new `theme-preview` route.
- Added role-param bootstrap assertion.
- Added postMessage-driven live role/color update assertion.
- Added foreign-origin message rejection assertion.
