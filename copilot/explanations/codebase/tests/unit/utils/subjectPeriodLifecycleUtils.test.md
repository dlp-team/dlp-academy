<!-- copilot/explanations/codebase/tests/unit/utils/subjectPeriodLifecycleUtils.test.md -->
# subjectPeriodLifecycleUtils.test.js

## Changelog
### 2026-04-03
- Added deterministic unit coverage for `subjectPeriodLifecycleUtils`:
  - timeline bound generation from institution calendar windows,
  - extraordinary-window role matrix behavior,
  - unknown pass-state students remain visible during extraordinary window,
  - post-course policy visibility behavior after extraordinary cutoff,
  - academic-year fallback behavior for legacy subjects without period bounds.

## Overview
- **Source file:** `tests/unit/utils/subjectPeriodLifecycleUtils.test.js`
- **Role:** Unit coverage for period timeline derivation and lifecycle visibility rules.

## Validation
- `npm run test:unit -- tests/unit/utils/subjectPeriodLifecycleUtils.test.js`
