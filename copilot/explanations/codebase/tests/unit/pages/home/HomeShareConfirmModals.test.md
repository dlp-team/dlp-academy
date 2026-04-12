<!-- copilot/explanations/codebase/tests/unit/pages/home/HomeShareConfirmModals.test.md -->
# HomeShareConfirmModals.test.jsx

## Overview
- **Source file:** `tests/unit/pages/home/HomeShareConfirmModals.test.jsx`
- **Last documented:** 2026-04-12
- **Role:** UI-level unit coverage for share/unshare batch confirmation preview behavior.

## Covered Scenarios
- Renders batch preview names and overflow marker for multi-item share confirmations.
- Suppresses preview block for single-item confirmations.
- Cancelling confirmation resets state including `batchPreview` payload.

## Related Runtime Surface
- `src/pages/Home/components/HomeShareConfirmModals.tsx`
- `src/pages/Home/hooks/useHomePageHandlers.ts`
- `src/pages/Home/hooks/useHomePageState.tsx`

## Changelog
- **2026-04-12:** Added initial suite to lock Phase 02 modal copy contract.
