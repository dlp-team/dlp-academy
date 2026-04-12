# HomeShareConfirmModals.tsx

## Overview
- **Source file:** `src/pages/Home/components/HomeShareConfirmModals.tsx`
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

## [2026-04-12] Phase 02 Batch Preview Rendering
### Context & Behavior
- Batch move flows now provide shared preview payloads (`totalCount`, `previewNames`, `overflowCount`) when deferred confirmation dialogs are opened.

### Change
- Added a reusable preview renderer in `HomeShareConfirmModals` that displays:
	- `Elementos afectados (N)` label,
	- up to five item names,
	- overflow marker (`... y X más.`) when applicable.
- Preview block only renders for true multi-item confirmations (`totalCount > 1`) to preserve existing single-item dialog copy.
- Close handlers now always clear `batchPreview` along with other modal state fields.

## [2026-04-09] Deferred Batch Cancel Hook Wiring
### Context & Behavior
- Batch selection move continuation now relies on modal close events to know when a deferred confirmation flow was canceled.

### Change
- `closeShareConfirm` and `closeUnshareConfirm` now invoke optional `onCancel` callbacks from modal payloads before resetting modal state.
- This keeps existing close behavior while enabling bulk move session finalization when users cancel share/unshare confirmation mid-batch.
