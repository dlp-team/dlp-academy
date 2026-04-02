<!-- copilot/explanations/codebase/tests/unit/services/shortcutMoveRequestService.test.md -->
# shortcutMoveRequestService.test.js

## Changelog
### 2026-04-02
- Added callable payload contract tests for:
  - `createShortcutMoveRequest`,
  - `resolveShortcutMoveRequest`.
- Added input guard tests for invalid:
  - `shortcutType`,
  - `resolution`.

## Overview
- **Source file:** `tests/unit/services/shortcutMoveRequestService.test.js`
- **Role:** Unit test suite for shortcut move request callable wrapper contracts.

## Notes
- Uses hoisted Firebase callable mocks and verifies normalized payloads.
