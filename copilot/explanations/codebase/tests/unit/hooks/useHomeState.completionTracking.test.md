<!-- copilot/explanations/codebase/tests/unit/hooks/useHomeState.completionTracking.test.md -->

## Overview
This suite validates Home completion-tracking behavior in `useHomeState`:
- active manual mode excludes completed subjects,
- history mode includes only completed subjects.

## Changelog
### 2026-04-01: Initial coverage for phase 10 completion filtering
- Added deterministic hook-level tests for completion-aware grouping behavior.
- Uses mocked shortcuts/persistence dependencies to isolate Home grouping logic.

## Validation
- `npm run test -- tests/unit/hooks/useHomeState.completionTracking.test.js`
