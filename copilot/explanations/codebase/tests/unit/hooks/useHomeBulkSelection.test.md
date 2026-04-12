<!-- copilot/explanations/codebase/tests/unit/hooks/useHomeBulkSelection.test.md -->
# useHomeBulkSelection.test.js

## Overview
- **Source file:** `tests/unit/hooks/useHomeBulkSelection.test.js`
- **Last documented:** 2026-04-11
- **Role:** Unit coverage for Home bulk-selection state transitions and de-dup semantics.

## Coverage
- Clears selection state when role/view context no longer supports selection mode.
- Removes selected ancestor folders when a child subject is selected.
- Removes selected descendant entries when a parent folder is selected.
- Aggregates deferred batch move continuations into a single deterministic undo payload.
- Verifies undo keeps selection mode disabled while restoring subject/folder sharing metadata.
- Verifies mixed subject+folder batch undo restores both location fields (`folderId`/`parentId`) and share metadata parity.
- Verifies Ctrl+Z keyboard shortcut triggers the same undo callback used by the undo toast action.
- Verifies Ctrl+Z shortcut is ignored when no undo payload is available.

## Changelog
### 2026-04-11
- Added explicit Ctrl+Z parity tests for bulk-selection undo (`undo callback parity` + `no-op without undo toast`).

### 2026-04-10
- Added mixed subject+folder undo restoration parity test coverage and expanded undo metadata assertions.

### 2026-04-08
- Added focused regression coverage for folder-child selection de-dup behavior in both directions.
