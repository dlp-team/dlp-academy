<!-- copilot/plans/active/autopilot-plan-scrollbar-execution-2026-04-12/phases/phase-03-bin-interaction-press-state-polish.md -->
# Phase 03 - Bin Interaction Press-State Polish

## Objective
Remove bin interaction visual regressions while preserving selection and overlay behavior.

## Scope
- Grid mode: eliminate second-click badge/label flicker on selected card.
- List mode: remove unwanted sibling dimming/desaturation when pressing one item.
- Preserve selection-mode and overlay behavior already validated.

## Primary File Surfaces
- `src/pages/Home/components/BinView.tsx`
- `src/pages/Home/components/bin/BinGridItem.tsx`
- `src/pages/Home/components/bin/BinSelectionOverlay.tsx`
- `src/utils/selectionVisualUtils.ts`

## Execution Status
- Status: COMPLETED (2026-04-12)
- Added overlay readiness handshake so selected grid cards are hidden only after overlay coordinates are measured and rendered.
- Removed non-selection-mode sibling dimming in list mode so pressing one item keeps other rows visually stable.
- Preserved selection-mode dimming and pressed-state visuals for selected rows/cards.

## Implemented File Surfaces
- `src/pages/Home/components/BinView.tsx`
- `src/pages/Home/components/bin/BinSelectionOverlay.tsx`
- `tests/unit/components/BinView.listPressState.test.jsx`
- `tests/unit/components/BinSelectionOverlay.test.jsx`

## Acceptance Criteria
- No transient badge invisibility on repeated grid item press.
- List siblings remain visually stable when one item is pressed.

## Validation
- Targeted Bin tests and manual grid/list parity checks.
- Executed and passed:
	- `tests/unit/components/BinView.listPressState.test.jsx`
	- `tests/unit/components/BinSelectionOverlay.test.jsx`
	- `tests/unit/pages/home/BinView.listInlinePanel.test.jsx`
	- `tests/unit/components/BinGridItem.test.jsx`
	- `tests/unit/utils/selectionVisualUtils.test.js`