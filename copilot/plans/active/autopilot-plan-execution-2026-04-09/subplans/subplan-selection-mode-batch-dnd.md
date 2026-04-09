<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/subplans/subplan-selection-mode-batch-dnd.md -->
# Subplan - Selection Mode Batch DnD

## Goal
Ensure selected items move as a coordinated batch with full drop-target parity and clean list-mode selection visuals.

## Work Items
- Audit existing drag-source composition for selected sets.
- Verify selected-item movement payload shape and drop target routing.
- Patch nested list border clipping/cropping issue in selection-mode state.
- Validate create-subject inert behavior while preserving visibility.

## Evidence Required
- Targeted test updates for selection hooks/components.
- Manual parity capture in checklist.
