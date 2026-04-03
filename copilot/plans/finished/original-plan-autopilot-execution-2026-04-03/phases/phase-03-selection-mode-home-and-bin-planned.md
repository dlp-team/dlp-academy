<!-- copilot/plans/active/original-plan-autopilot-execution-2026-04-03/phases/phase-03-selection-mode-home-and-bin-planned.md -->
# Phase 03 - Selection Mode Home and Bin

## Status
COMPLETED

## Objective
Unify selection-mode UX between Home and Bin, remove undesired initial blue state on Home, and enable multi-select in Bin.

## Work Items
- Locate Home selection-state color/activation logic.
- Update Selection Mode header layout for a simpler, cleaner, aligned left-side badge/button arrangement.
- Implement Bin multi-select behavior parity.
- Reuse shared selection toolbar component/hook when possible.

## Preserved Behaviors
- Existing selection actions and permission checks remain intact.
- Blue selection indication remains available once an item is selected.

## Risks
- Shared toolbar changes could affect other contexts.
- Bin data model may have single-select assumptions in handlers.

## Validation
- UI interaction checks for Home and Bin selection flows.
- `get_errors` for touched UI files.

## Exit Criteria
- Home initial selection mode no longer appears persistently blue.
- Bin supports selecting multiple elements.
- Home/Bin selection headers share consistent visual behavior.

## Completion Notes
- Refined `HomeSelectionToolbar` styling so selection mode is neutral until there are selected items.
- Reorganized toolbar actions into a cleaner left-right structure with badge aligned next to "Salir de la selección".
- Fixed Bin grid multi-select blocker by allowing interactions on non-selected cards while in selection mode.
- Aligned Bin selection header style and selected badge behavior with Home.
- `get_errors` validation passed for all touched selection-mode files.
