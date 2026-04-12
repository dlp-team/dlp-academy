<!-- copilot/explanations/codebase/tests/unit/pages/home/HomeContent.selectionModifiers.test.md -->
# HomeContent.selectionModifiers.test.jsx

## Overview
- **Source file:** `tests/unit/pages/home/HomeContent.selectionModifiers.test.jsx`
- **Last documented:** 2026-04-12
- **Role:** Focused modifier-click regression coverage for Home selection behavior in list mode.

## Coverage
- Verifies Ctrl/Cmd+click outside selection mode activates selection mode and selects the clicked item.
- Verifies Ctrl/Cmd+click on an already-selected item in selection mode navigates instead of toggling selection.
- Verifies Ctrl/Cmd+Shift+click applies contiguous range selection from anchor to target by rendered order.

## Test Design Notes
- Mocks Home content DnD and auto-scroll hooks to isolate selection interaction logic.
- Mocks list rows with explicit `data-selection-key` attributes so DOM-order range behavior is deterministic.
- Keeps assertions focused on interaction contracts (`setSelectMode`, `onToggleSelectItem`, navigation callbacks).

## Changelog
### 2026-04-12
- Added initial test suite for Phase 01 modifier-click parity implementation.
