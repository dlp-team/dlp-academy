<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-10/phases/phase-03-bin-and-notification-system-refactor.md -->
# Phase 03 - Bin and Notification System Refactor

## Status
- IN_REVIEW

## Objective
Stabilize bin interaction visuals and unify home notification delivery into a reusable bottom-left notification card flow.

## Scope
- Bin grid: remove second-click flicker/invisibility when re-pressing selected item.
- Bin list: remove background opacity mutation on press.
- Home notifications: bottom-left placement, no layout shift, timed disappearance.
- Create or align reusable notification card component for cross-web reuse.

## Risks
- Notification timing dedupe can suppress valid distinct events.
- Press-state style changes can diverge between list and grid.

## Exit Criteria
- [x] Bin grid press behavior smooth on repeated press.
- [x] Bin list background opacity remains stable.
- [x] Bottom-left notifications do not shift page layout.
- [x] Reusable notification card component integrated.

## Implementation Update (2026-04-10)
- Bin grid selected-card hide path now uses `invisible` (instead of opacity fade) and transform-focused transitions, preventing transient flicker/invisibility when re-pressing the same selected card.
- Added list press-state regression assertion to ensure selected list wrappers do not apply opacity-based dimming while pressed.
- Home action/shortcut feedback no longer renders as inline banners inside content flow; it now reuses `AppToast` in fixed lower-left positioning (`bottom-24 left-5`) to avoid layout shifts.
- `AppToast` was extended with optional positioning (`positionClassName`) and optional close-button rendering (shown only when `onClose` is provided), enabling reusable non-shifting Home notifications.

## Validation Evidence (2026-04-10)
- `get_errors` on touched source/test files -> PASS.
- `npm run test -- tests/unit/components/AppToast.test.jsx tests/unit/components/BinGridItem.test.jsx tests/unit/components/BinSelectionOverlay.test.jsx tests/unit/components/BinView.listPressState.test.jsx` -> PASS (12 tests).
