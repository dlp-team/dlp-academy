<!-- copilot/explanations/codebase/tests/unit/components/ListViewItem.selectionDimming.test.md -->
# ListViewItem.selectionDimming.test.jsx

## Overview
- **Source file:** `tests/unit/components/ListViewItem.selectionDimming.test.jsx`
- **Last documented:** 2026-04-05
- **Role:** Focused contract tests for Home list-mode selection/dimming logic in `ListViewItem`.

## Coverage
- Unselected subject rows dim when Home selection mode has active selections.
- Selected subject rows keep selection ring and do not receive dimming classes.
- Folder-row render path receives row-level dimming class contract for recursive list scenarios.

## Changelog
### 2026-04-05
- Added suite during Phase 02 Block D to lock nested list selection-dimming behavior.
