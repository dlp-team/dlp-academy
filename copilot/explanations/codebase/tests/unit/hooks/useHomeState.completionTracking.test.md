<!-- copilot/explanations/codebase/tests/unit/hooks/useHomeState.completionTracking.test.md -->

## Overview
This suite validates Home completion-tracking behavior in `useHomeState`:
- completed subjects remain visible in manual grouped views,
- stale persisted `history` mode falls back to regular grouped output after history retirement.

## Changelog
### 2026-04-02: Updated for history-mode retirement behavior
- Replaced history-only expectations with fallback-to-regular-grouping assertions.
- Validates completed subjects are still visible after history/send-to-history removal.

### 2026-04-01: Initial coverage for phase 10 completion filtering
- Added deterministic hook-level tests for completion-aware grouping behavior.
- Uses mocked shortcuts/persistence dependencies to isolate Home grouping logic.

## Validation
- `npm run test -- tests/unit/hooks/useHomeState.completionTracking.test.js`
