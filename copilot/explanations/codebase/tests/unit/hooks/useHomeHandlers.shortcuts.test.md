<!-- copilot/explanations/codebase/tests/unit/hooks/useHomeHandlers.shortcuts.test.md -->
# useHomeHandlers.shortcuts.test.js

## Overview
- **Source file:** `tests/unit/hooks/useHomeHandlers.shortcuts.test.js`
- **Last documented:** 2026-03-30
- **Role:** Unit coverage for Home handler role gates, shortcut actions, and destructive flow behavior.

## Coverage
- Owner/non-owner delete gates for subjects/folders.
- Shortcut unshare/hide/delete behavior across shared and non-shared trees.
- Manual-order updates after successful delete operations.
- Drag/drop and folder nesting error reporting via `onHomeFeedback` callback.

## Changelog
### 2026-03-30
- Added error-flow assertions to verify `useHomeHandlers` reports inline Home feedback (error tone) for failed drop/nesting operations instead of browser alerts.

### 2026-03-30 (Slice 4)
- Added save/delete failure assertions to verify callback-based feedback for:
	- edited subject save failures,
	- edited folder save failures,
	- shortcut-folder unshare failures.
