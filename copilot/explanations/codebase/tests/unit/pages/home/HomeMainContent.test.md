<!-- copilot/explanations/codebase/tests/unit/pages/home/HomeMainContent.test.md -->
# HomeMainContent.test.jsx

## Overview
- **Source file:** `tests/unit/pages/home/HomeMainContent.test.jsx`
- **Last documented:** 2026-04-11
- **Role:** Unit coverage for Home main-content branch routing and selection-mode create-action passthrough.

## Coverage
- Renders bin branch when Home view mode is `bin`.
- Renders shared branch for non-student shared mode.
- Renders empty-state branch for manual mode without content.
- Verifies empty-state create-subject entry remains visible while selection mode is active, but is passed selection context so the action remains inert.

## Changelog
### 2026-04-11
- Updated selection-mode contract assertion: `canCreateSubject` remains `true` and `selectMode` is forwarded, matching visible-but-inert behavior.

### 2026-04-08
- Added initial selection-mode create-action regression assertion (later superseded by the 2026-04-11 visible-but-inert contract correction).
