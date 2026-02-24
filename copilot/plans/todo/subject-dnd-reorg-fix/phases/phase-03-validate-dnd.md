# Phase 03: Validate DnD in Home

## Objective
Ensure subject drag-and-drop into folders works in Home views, including shared-folder breadcrumb transitions.

## Changes
- Added optimistic move and fast-path behavior for subject list-mode moves.
- Updated confirmation rules for subject drops to compare source-folder sharing vs target-folder sharing.
- Added robust move cleanup to remove subject from all non-target source folders during a move.
- Verified no static errors in updated handlers/hooks.

## Risks
- Manual regression validation still pending for complex shared-folder permutations.

## Completion Notes
- In progress.
- Implemented fixes cover:
	- unshare confirmation when sharing is reduced (including breadcrumb moves)
	- no confirmation when moving between folders with identical sharing
	- prevention of duplicate subject membership after move
- Pending manual end-to-end verification before marking COMPLETE.
