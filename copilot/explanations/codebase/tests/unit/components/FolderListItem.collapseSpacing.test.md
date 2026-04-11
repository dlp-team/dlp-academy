<!-- copilot/explanations/codebase/tests/unit/components/FolderListItem.collapseSpacing.test.md -->
# FolderListItem.collapseSpacing.test.jsx

## Overview
- **Source file:** `tests/unit/components/FolderListItem.collapseSpacing.test.jsx`
- **Last documented:** 2026-04-10
- **Role:** Focused regression coverage for Home manual-list collapsed folder spacing behavior.

## Coverage
- Verifies collapsed children shell uses `grid-rows-[0fr]`.
- Verifies collapsed children content uses `overflow-hidden pb-0` to prevent blank-space leakage.
- Verifies expanded children shell/content classes switch to `grid-rows-[1fr]` and `overflow-visible pb-1`.
- Verifies collapse-after-expand returns to clipped wrapper classes.

## Changelog
### 2026-04-10
- Added suite to lock collapse/expand wrapper class contracts in `FolderListItem` and prevent regression where collapsed folders left visible empty space.
