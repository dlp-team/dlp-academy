<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/subplans/subplan-shortcuts-copy-cut-undo-ownership.md -->
# Subplan - Shortcuts Copy/Cut/Undo Ownership

## Goal
Make keyboard copy/cut flows ownership-safe, deep-copy complete, and undo-consistent.

## Work Items
- Enforce non-shared ownership metadata in shortcut copy outputs.
- Validate deep-copy of nested topic resources and dependent entities.
- Support undo behavior for copy/cut/paste actions per policy.
- Handle required metadata dependencies with deterministic fallback or prompt flow.

## Evidence Required
- Shortcut behavior tests covering copy, cut, paste, and undo paths.
- Data-integrity checks for nested clones.
