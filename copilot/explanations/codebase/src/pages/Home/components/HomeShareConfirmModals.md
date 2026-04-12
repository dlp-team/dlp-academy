# HomeShareConfirmModals.jsx

## Overview
- **Source file:** `src/pages/Home/components/HomeShareConfirmModals.jsx`
- **Last documented:** 2026-02-24
- **Role:** Reusable UI component consumed by the parent page/module.

## Responsibilities
- Handles user events and triggers updates/actions.

## Exports
- `default HomeShareConfirmModals`

## Main Dependencies
- `react`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## [2026-04-09] Deferred Batch Cancel Hook Wiring
### Context & Behavior
- Batch selection move continuation now relies on modal close events to know when a deferred confirmation flow was canceled.

### Change
- `closeShareConfirm` and `closeUnshareConfirm` now invoke optional `onCancel` callbacks from modal payloads before resetting modal state.
- This keeps existing close behavior while enabling bulk move session finalization when users cancel share/unshare confirmation mid-batch.
