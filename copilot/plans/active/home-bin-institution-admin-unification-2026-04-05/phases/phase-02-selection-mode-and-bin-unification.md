<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-02-selection-mode-and-bin-unification.md -->
# Phase 02 - Selection Mode and Bin Unification

## Status
- IN_PROGRESS

## Objective
Unify selection-mode behavior between Home and Bin and implement requested Bin grid/list interaction refinements.

## Deliverables
- Shared selection-state behavior layer for Home and Bin where feasible.
- Home selection dimming behavior:
  - when selection mode is active and at least one item is selected,
  - unselected items lose saturation to emphasize selected elements.
- Bin grid mode behavior update:
  - remove backdrop blur and border artifacts,
  - apply smooth scale-focus transition for selected card,
  - keep action options reveal after focus transition.
- Bin list mode behavior update:
  - action area appears directly below selected item,
  - items below shift downward smoothly,
  - action area style matches grid mode language.

## Lossless Constraints
- Preserve existing multi-select semantics and keyboard/shortcut interactions.
- Do not break bulk-action flows or permission checks.
- Keep accessibility and focus order stable.

## Validation Gate
- Unit/UI tests covering selection state and Bin grid/list transitions.
- Regression verification for non-selection flows in Home.
- Lint/typecheck pass.

## Exit Criteria
- Selection and Bin behaviors are visually and functionally consistent with requested UX.

## Kickoff Notes (2026-04-05)
- Phase 01 closure completed with stable modal and validation foundations.
- Phase 02 starts with a dependency-safe slice:
  1. audit current selection dimming logic across Home and Bin,
  2. align shared selection emphasis behavior,
  3. implement first Bin interaction refinement with focused tests.

## Progress Log
- 2026-04-05 - Block A completed
  - Added Home unselected-dimming helper in [src/utils/selectionVisualUtils.ts](src/utils/selectionVisualUtils.ts).
  - Applied selection-mode dimming to Home grid cards in [src/pages/Home/components/HomeContent.tsx](src/pages/Home/components/HomeContent.tsx).
  - Refined Bin grid overlay focus in [src/pages/Home/components/bin/BinSelectionOverlay.tsx](src/pages/Home/components/bin/BinSelectionOverlay.tsx):
    - removed blur backdrop,
    - added selected-card focus transition,
    - delayed action panel reveal to follow the focus transition.
  - Added/updated focused tests:
    - [tests/unit/utils/selectionVisualUtils.test.js](tests/unit/utils/selectionVisualUtils.test.js)
    - [tests/unit/components/BinSelectionOverlay.test.jsx](tests/unit/components/BinSelectionOverlay.test.jsx)
  - Validation evidence:
    - `npm run test -- tests/unit/utils/selectionVisualUtils.test.js tests/unit/components/BinSelectionOverlay.test.jsx tests/unit/components/BinGridItem.test.jsx tests/unit/pages/home/HomeMainContent.test.jsx` (PASS)
    - `npm run test -- tests/unit/components/BinSelectionOverlay.test.jsx tests/unit/utils/selectionVisualUtils.test.js` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

- 2026-04-05 - Block B completed
  - Updated [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx) list mode so the selected-item action panel renders directly under the selected row.
  - Removed the old bottom-of-list action aside in list mode.
  - Added smooth inline transition classes for row/panel movement.
  - Added focused coverage in [tests/unit/pages/home/BinView.listInlinePanel.test.jsx](tests/unit/pages/home/BinView.listInlinePanel.test.jsx).
  - Validation evidence:
    - `npm run test -- tests/unit/pages/home/BinView.listInlinePanel.test.jsx tests/unit/components/BinSelectionOverlay.test.jsx tests/unit/components/BinGridItem.test.jsx tests/unit/utils/selectionVisualUtils.test.js` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)
