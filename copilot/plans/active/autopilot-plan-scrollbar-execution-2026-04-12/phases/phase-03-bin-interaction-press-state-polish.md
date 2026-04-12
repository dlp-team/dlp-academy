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

## Acceptance Criteria
- No transient badge invisibility on repeated grid item press.
- List siblings remain visually stable when one item is pressed.

## Validation
- Targeted Bin tests and manual grid/list parity checks.