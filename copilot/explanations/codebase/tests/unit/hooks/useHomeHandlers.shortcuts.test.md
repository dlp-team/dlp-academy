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
### 2026-04-02
- Updated non-owner subject deletion assertion to reflect explicit feedback behavior (`setDeleteConfig` updater adds permission error message) instead of silent modal close.
- Added institution-admin subject deletion role-path tests:
	- allow same-institution institution admin deletion,
	- deny cross-institution institution admin deletion with explicit feedback.

### 2026-04-01
- Updated import path in `tests/unit/hooks/useHomeHandlers.shortcuts.test.js` to the current module location (`src/hooks/useHomeHandlers`) after hook relocation.
- Keeps shortcut sharing/role-gate coverage executable under current source layout without changing behavioral assertions.

### 2026-03-30
- Added error-flow assertions to verify `useHomeHandlers` reports inline Home feedback (error tone) for failed drop/nesting operations instead of browser alerts.

### 2026-03-30 (Slice 4)
- Added save/delete failure assertions to verify callback-based feedback for:
	- edited subject save failures,
	- edited folder save failures,
	- shortcut-folder unshare failures.
