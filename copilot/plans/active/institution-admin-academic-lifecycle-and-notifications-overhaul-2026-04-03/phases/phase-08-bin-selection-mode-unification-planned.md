<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-08-bin-selection-mode-unification-planned.md -->
# Phase 08 - Bin Selection Mode Unification (PLANNED)

## Objective
Unify selection visuals between Bin and other views and introduce non-opacity dimming for unselected items.

## Planned Changes
- Reuse shared selection styling logic between manual and bin modes.
- When at least one item is selected, dim unselected items with brightness/saturation strategy.
- Keep folder legibility by avoiding opacity changes.
- Rename Bin sort labels to:
  - `Urgencia: Ascendente`
  - `Urgencia: Descendente`

## Risks and Controls
- Risk: global style changes regress non-bin views.
  - Control: isolate style hooks and verify across Home and Bin modes.

## Exit Criteria
- Selection border consistency is visually identical.
- Dimming behavior works without affecting folder content readability.
