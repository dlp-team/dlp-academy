<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/phases/phase-03-bin-grid-list-press-parity.md -->
# Phase 03 - Bin Grid/List Press Parity

## Status
- IN_REVIEW

## Objective
Refine bin-tab press interactions so grid/list behavior is visually clean, consistent, and free of duplication artifacts.

## Scope
- Remove duplicated-card visual artifact on grid press.
- Preserve intended scale effect for card and label text only.
- Remove background opacity change in grid press path.
- Align list-mode press styling with refined grid behavior where applicable.

## Risks
- Press-state animation changes can regress accessibility focus feedback.
- Shared visual token updates may affect non-bin cards.

## Validation
- Component-level tests for bin card/list pressed states.
- Manual visual checks in grid and list modes.
- `get_errors` and targeted suite runs.

## Exit Criteria
- No card duplication artifact in grid mode.
- No unwanted backdrop opacity dimming on bin card press.
- Grid/list press states feel coherent and non-disruptive.

## Implementation Update (2026-04-09)
- Eliminated grid press background dimming by bypassing non-selection-mode bin dimming on grid cards.
- Removed darkened overlay backdrop (`bg-transparent`) while preserving outside-click close behavior.
- Added selected-card hide mode behind overlay clone to avoid perceived duplicate-card rendering.

## Validation Evidence (2026-04-09)
- `get_errors` on touched bin files -> PASS.
- `npm run test -- tests/unit/components/BinGridItem.test.jsx tests/unit/components/BinSelectionOverlay.test.jsx` -> PASS.
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> PASS.
