// copilot/explanations/codebase/tests/unit/hooks/useHomeKeyboardShortcuts.test.md

## Changelog
### 2026-03-09: New dedicated keyboard-shortcuts edge-case tests
- Added a standalone unit suite for `useHomeKeyboardShortcuts`.
- Validates critical keyboard paths for Ctrl+C/X/V/Z with mocked `useKeyShortcuts` handler bridging.
- Covers:
  - Subject cut+paste updates `folderId`.
  - Folder cut+paste updates `parentId`.
  - Folder self/descendant move blocking.
  - Undo for move actions and bin-restore fallback behavior.
  - Restore retry behavior when first trashed candidate restore fails.
  - Card visual state transitions for animation and cut-pending opacity.
  - Typing-target short-circuit and shortcut-entity copy/cut blocking.
  - Empty-state guards (no selected card, empty clipboard paste, undo with no actions).

## Overview
This test file protects regression-prone keyboard flows for Home cards by exercising the hook handlers directly, including asynchronous state transitions between cut, paste, and undo operations.

## Notes
- Uses separate `act()` turns for sequential shortcuts to reflect real user keypress timing and avoid false negatives from batched state updates.
- Mocks `console.error` in tests to keep intentional failure-path assertions deterministic and noise-free.
