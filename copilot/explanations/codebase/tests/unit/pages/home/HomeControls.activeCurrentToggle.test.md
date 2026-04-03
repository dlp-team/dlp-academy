<!-- copilot/explanations/codebase/tests/unit/pages/home/HomeControls.activeCurrentToggle.test.md -->

## Overview
Validates Home lifecycle visibility toggle behavior in `HomeControls`:
- toggle is visible only in `courses` and `usage` modes,
- toggle writes both local setter intent and persisted preference key (`showOnlyCurrentSubjects`).
- period selector writes local setter + persisted preference key (`subjectPeriodFilter`) in `courses` mode.

## Changelog
### 2026-04-03: Added period selector persistence assertions
- Added unit coverage for period filter select changes:
  - asserts `setSubjectPeriodFilter` receives selected value,
  - asserts `onPreferenceChange('subjectPeriodFilter', value)` is emitted,
  - asserts selector is hidden in unsupported modes.

### 2026-04-02: Initial coverage for active/current controls toggle
- Added unit tests for:
  - lifecycle toggle visibility in supported/unsupported view modes,
  - setter + preference callback payload correctness when toggled.

## Validation
- `npm run test:unit -- tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx`
