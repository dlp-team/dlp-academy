<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/subplans/subplan-undo-and-confirmation-pipeline.md -->
# Subplan - Undo and Confirmation Pipeline

## Goal
Unify batch confirmation and undo behavior so protected moves and Ctrl+Z actions are deterministic across selected-item operations.

## Work Items
- Trace single-item vs batch confirmation code paths.
- Enforce one confirmation interaction per batch action.
- Ensure undo payload includes all affected entries.
- Validate replacement semantics when consecutive actions occur.

## Evidence Required
- Batch confirmation tests and undo payload assertions.
- Manual check for full-batch revert correctness.
