# Copilot Plans

This folder contains all planning, phase, and roadmap documents for the Copilot-driven development and refactor process. All previous contents from `.copilot-plans` have been migrated here for clarity and better organization.

## Structure

- `active/`: Plans currently being executed.
- `todo/`: Plans drafted but not yet started.
- `inReview/`: Plans that are implementation-complete and currently under verification before closure.
- `archived/`: Superseded or paused plans retained for reference.
- `finished/`: Completed plans.

## Plan Lifecycle

1. Create new plan in `todo/`.
2. Move to `active/` when implementation starts.
3. Move to `inReview/` when implementation is complete and verification starts.
4. Move to `finished/` only after review checklist passes.
5. Move to `archived/` if cancelled, superseded, or intentionally paused.

## Plan Directory Organization

Each plan folder should include:

- `README.md`: plan context, scope, assumptions, and current status summary.
- `strategy-roadmap.md`: source of truth for sequencing and phase status.
- `phases/`: one file per phase with scope, execution summary, and outcomes.
- `subplans/`: optional deeper plans for scoped initiatives inside a phase.
- `working/`: temporary working notes, scratch docs, or migration notes.
- `reviewing/`: verification artifacts.

## Reviewing Folder Rules

Use `reviewing/` for final verification before moving a plan to `finished/`.

- Add at least one checklist file with task checkboxes for validation scenarios (smoke tests, regressions, rule checks, data checks, etc.).
- If any checklist item fails and requires code/data changes, add a review log file describing:
	- what failed,
	- how it was reproduced,
	- the fix applied,
	- the re-test result.
- Keep plan in `inReview/` until all required checklist items pass.
