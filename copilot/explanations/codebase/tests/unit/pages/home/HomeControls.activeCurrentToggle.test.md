<!-- copilot/explanations/codebase/tests/unit/pages/home/HomeControls.activeCurrentToggle.test.md -->

## Overview
Validates Home lifecycle visibility toggle behavior in `HomeControls`:
- toggle is visible only in `courses` and `usage` modes,
- toggle writes both local setter intent and persisted preference key (`showOnlyCurrentSubjects`).

## Changelog
### 2026-04-02: Initial coverage for active/current controls toggle
- Added unit tests for:
  - lifecycle toggle visibility in supported/unsupported view modes,
  - setter + preference callback payload correctness when toggled.

## Validation
- `npm run test -- tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx`
