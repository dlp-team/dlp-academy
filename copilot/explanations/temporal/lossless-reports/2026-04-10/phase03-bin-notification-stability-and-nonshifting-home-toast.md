<!-- copilot/explanations/temporal/lossless-reports/2026-04-10/phase03-bin-notification-stability-and-nonshifting-home-toast.md -->
# Lossless Report - Phase 03 Bin/Notification Stability and Non-Shifting Home Toast (2026-04-10)

## Requested Scope
- Continue active Step 7 implementation for Phase 03 (bin interaction and home notification stability).
- Fix bin grid selected-card re-press flicker/invisibility behavior.
- Ensure list pressed-state flow does not mutate opacity/background unexpectedly.
- Move Home feedback notifications to a reusable fixed notification card flow that does not shift page layout.

## Preserved Behaviors
- Bin selection mode ring and dimming behavior remain unchanged.
- Bin overlay interaction model (selected card + side panel) remains unchanged.
- Existing notification visual kind mapping and icon logic in `notificationVisualUtils` remains unchanged.
- Undo card (`UndoActionToast`) behavior and 5-second selection/shortcut undo lifecycle remain unchanged.

## Touched Files
- `src/pages/Home/components/bin/BinGridItem.tsx`
- `src/pages/Home/Home.tsx`
- `src/components/ui/AppToast.tsx`
- `tests/unit/components/BinView.listPressState.test.jsx`
- `tests/unit/components/AppToast.test.jsx`

## Per-File Verification
- `BinGridItem.tsx`: replaced opacity-hide overlay mode with `invisible` and limited transition scope to transform/filter/shadow, removing visible fade flicker when deselecting a pressed item.
- `Home.tsx`: replaced inline feedback banners with fixed reusable `AppToast` usage (`bottom-24 left-5`) for bulk and shortcut feedback, preventing layout shifts in the Home content region.
- `AppToast.tsx`: added optional `positionClassName` support and conditional close-button rendering only when `onClose` is provided, preserving existing default placement behavior.
- `BinView.listPressState.test.jsx`: added assertion that selected list wrappers do not use opacity mutation on pressed state.
- `AppToast.test.jsx`: added regression coverage for custom position class and optional close-button rendering.

## Validation Summary
- `get_errors` on touched source/test files: PASS.
- `npm run test -- tests/unit/components/AppToast.test.jsx tests/unit/components/BinGridItem.test.jsx tests/unit/components/BinSelectionOverlay.test.jsx tests/unit/components/BinView.listPressState.test.jsx`: PASS (12 tests).
