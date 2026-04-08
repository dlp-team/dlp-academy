<!-- copilot/explanations/codebase/tests/unit/hooks/useHomeContentDnd.test.md -->
# useHomeContentDnd.test.js

## Changelog
- **2026-04-08:** Added select-mode batch drag/drop parity coverage:
  - selected subject list-drop routes through bulk move callback,
  - selected folder root-drop routes through bulk move callback,
  - existing single-item drag/drop branches remain covered.

## Overview
- **Source file:** `tests/unit/hooks/useHomeContentDnd.test.js`
- **Role:** Regression-focused unit tests for Home content DnD hook behavior.

## Responsibilities
- Verifies promote-zone behavior for subject/folder drag paths.
- Verifies root/list drop routing for single-item and batch-selected contexts.
- Verifies reorder and shortcut nesting branches remain deterministic.

## Notes
- The suite is intentionally branch-oriented so drag/drop regressions can be detected without full page integration tests.
