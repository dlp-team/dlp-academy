<!-- copilot/explanations/temporal/lossless-reports/2026-04-12/phase03-bin-press-state-and-overlay-readiness.md -->
# Lossless Report - Phase 03 Bin Press-State and Overlay Readiness

## Requested Scope
- Continue active plan execution with Phase 03:
  - Remove grid second-click flicker/invisibility around selected bin cards.
  - Remove list sibling dimming/saturation side-effect when pressing one item outside selection mode.

## Implemented
1. Added an overlay readiness callback contract in `BinSelectionOverlay`.
2. Added `gridOverlayReady` state in `BinView` and gated selected-card hiding until overlay readiness is confirmed.
3. Changed list-mode dimming predicate in `BinView` so non-selection-mode press no longer dims unselected siblings.
4. Added targeted regression assertions for list sibling stability and overlay readiness callback behavior.

## Preserved Behaviors
- Selection mode still dims unselected list/bin entries as before.
- Selected pressed-state shell style (`scale` + `shadow`) remains active outside selection mode.
- Grid overlay positioning, panel placement, and backdrop close behavior remain unchanged.
- Existing list inline action panel behavior and action labels remain unchanged.

## Touched Files
- `src/pages/Home/components/BinView.tsx`
- `src/pages/Home/components/bin/BinSelectionOverlay.tsx`
- `tests/unit/components/BinView.listPressState.test.jsx`
- `tests/unit/components/BinSelectionOverlay.test.jsx`

## File-by-File Verification
- `src/pages/Home/components/BinView.tsx`
  - Added `gridOverlayReady` state lifecycle reset logic.
  - Hid the base selected grid card only when overlay readiness callback has fired.
  - Removed list-mode non-selection dimming by setting list `hasSelection` to selection-mode only.
- `src/pages/Home/components/bin/BinSelectionOverlay.tsx`
  - Added optional `onOverlayReady` callback.
  - Added one-time notification guard per selected item to avoid repeated callback churn.
- `tests/unit/components/BinView.listPressState.test.jsx`
  - Expanded mocked subject set to two rows.
  - Added assertion that unselected sibling wrapper no longer carries brightness/saturation dimming tokens.
- `tests/unit/components/BinSelectionOverlay.test.jsx`
  - Added assertion that readiness callback fires exactly once after coordinate measurement.

## Validation Summary
- `get_errors` clean on all touched Phase 03 files.
- Targeted test command passed:
  - `npm run test -- tests/unit/components/BinView.listPressState.test.jsx tests/unit/components/BinSelectionOverlay.test.jsx tests/unit/pages/home/BinView.listInlinePanel.test.jsx tests/unit/components/BinGridItem.test.jsx tests/unit/utils/selectionVisualUtils.test.js`

## Next Phase
- Phase 04: Institution customization preview parity.
