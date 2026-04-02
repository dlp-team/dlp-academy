<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/subplans/subplan-02-bin-and-deletion-architecture.md -->

# Subplan 02 - Bin and Deletion Architecture

## Scope
- Folder delete 3-option behavior alignment.
- Bin-first lifecycle for folder plus contents and institution course/class deletions.
- Nested bin display semantics.

## Acceptance Criteria
- Delete-folder-only bypasses bin for folder container as requested.
- Delete-folder-plus-contents moves container + children to bin, with top-layer folder display.
- Institution admin deletion requires typed name confirmation and routes to institution bin.

## Status
- COMPLETED
- Completed in current cycle:
	- folder `delete all` now routes through bin-first lifecycle,
	- top-level bin container behavior for trashed folders,
	- nested subfolder drilldown and subtree-scoped restore/permanent-delete actions.
	- institution admin course/class bin lifecycle with typed-name destructive confirmation.

