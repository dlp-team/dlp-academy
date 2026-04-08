<!-- copilot/explanations/codebase/tests/unit/pages/home/HomeMainContent.test.md -->
# HomeMainContent.test.jsx

## Overview
- **Source file:** `tests/unit/pages/home/HomeMainContent.test.jsx`
- **Last documented:** 2026-04-08
- **Role:** Unit coverage for Home main-content branch routing and selection-mode create-action passthrough.

## Coverage
- Renders bin branch when Home view mode is `bin`.
- Renders shared branch for non-student shared mode.
- Renders empty-state branch for manual mode without content.
- Verifies empty-state create-subject action is disabled while selection mode is active.

## Changelog
### 2026-04-08
- Added regression assertion that `HomeMainContent` passes `canCreateSubject = false` to empty-state surface when `selectMode` is enabled.
