<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-02-selection-mode-and-bin-unification.md -->
# Phase 02 - Selection Mode and Bin Unification

## Status
- PLANNED

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
