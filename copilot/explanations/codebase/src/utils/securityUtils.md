# securityUtils.js

## Overview
- **Source file:** `src/utils/securityUtils.js`
- **Last documented:** 2026-03-07
- **Role:** Security helper utilities for deterministic dynamic codes used in institutional registration flows.

## Exports
- `generateDynamicCode(institutionId, role, intervalHours, currentTimeMs = Date.now())`

## Behavior
- Builds a deterministic code seed from institution, role, and the active rotation window.
- Produces an uppercase 6-character hexadecimal code.
- Uses a simple hash over the seed to avoid exposing raw identifiers.
- Supports an optional timestamp override (`currentTimeMs`) to allow deterministic verification/testing for a specific instant.

## 2026-03-07 Notes
- Added optional `currentTimeMs` argument so the process can be verified from known inputs:
  - given `institutionId`, current time, and interval hours,
  - recompute the exact expected teacher code for that window.
- Added unit tests in `tests/unit/utils/securityUtils.test.js` for:
  - determinism inside one window,
  - window-rotation changes,
  - reproducible verification at a fixed timestamp.

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src` for maintenance and onboarding.
