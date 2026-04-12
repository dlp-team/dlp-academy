<!-- copilot/protocols/plan-creation-protocol.md -->
# Plan Creation Protocol

## Purpose

Define a consistent process for creating, executing, reviewing, and closing plans in `copilot/plans`.

**CRITICAL PHILOSOPHY**: Quality and thoroughness are more important than speed. Every phase must be fully validated before marking complete.

## AUTOPILOT_PLAN Intake Trigger (MANDATORY)

When a prompt/chat references `AUTOPILOT_PLAN.md` or explicitly says "autopilot plan", this protocol must route execution to `copilot/ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md` immediately.

Required behavior:

1. Check both source paths:
  - `AUTOPILOT_PLAN.md`
  - `copilot/plans/AUTOPILOT_PLAN.md`
2. Intake the first existing source into:
  - `copilot/plans/active/<plan-name>/sources/source-autopilot-user-spec-<plan-topic>.md`
3. Remove the original source from its prior location (no duplicate source files).
4. Include a final plan phase to continue checklist execution from Step 7 onward.
5. Update `BRANCH_LOG.md` with:
  - `Autopilot Status` set to active (`true`)
  - `Merge Status` set to `pending-human-approval`
6. During autopilot merge flow, authorization must come from human-updated `BRANCH_LOG.md` merge status (not from `vscode/askQuestions`).
7. Preserve plan lineage in `BRANCH_LOG.md` related plans:
  - Keep prior plans from the same branch lineage (current branch and ancestor branch).
  - Do not delete prior same-lineage plan entries when adding a new plan.
  - If a prior plan changes lifecycle (for example `active` to `finished`), update its path/state entry instead of removing it.

## When to Create a New Plan

Create a new plan when work is multi-step, cross-cutting, migration-related, risky, or expected to span more than one session.

Typical triggers:

- Schema/data migrations
- Security rules changes
- Cross-module refactors
- Features requiring phased rollout
- Work that needs explicit verification criteria before release

## Plan State Folders

Top-level lifecycle folders in `copilot/plans`:

- `todo/`: Plan drafted, not started
- `active/`: In implementation
- `inReview/`: Implementation complete, under validation
- `finished/`: Fully verified and closed
- `archived/`: Cancelled/superseded/paused plans kept for history

## Required Plan Structure

Each plan folder should contain:

- `README.md`
  - Problem statement
  - Scope / non-goals
  - Current status summary
  - Key decisions and assumptions
- `strategy-roadmap.md`
  - Ordered phases
  - Status per phase (PLANNED, IN_PROGRESS, COMPLETED)
  - Immediate next actions
- `phases/`
  - One file per phase
  - Include objective, changes, risks, and completion notes
- `subplans/`
  - Optional deeper plans tied to a phase or subsystem
- `working/`
  - Temporary notes, diagnostics, migration scratch docs
- `reviewing/`
  - Verification checklists and review logs used before closure

## Phase Management Rules

1. `strategy-roadmap.md` is the source of truth for sequencing and status.
2. Any phase marked IN_PROGRESS or COMPLETED must have a matching file in `phases/`.
3. Phase files must be updated when status or scope changes.
4. Plan `README.md` must always reflect current phase state.
5. **Quality-First Rule**: Before marking a phase COMPLETED:
   - [ ] All tests passed locally (`npm run test`)
   - [ ] Linting passed (`npm run lint`)
   - [ ] Adjacent functionality verified (no regressions)
   - [ ] Edge cases and error states tested
   - [ ] Developer did not rush or skip validation steps
   - [ ] Lossless report documents all changes and validations
   - [ ] 3-5 commits exist for that phase (showing incremental, validated progress)
6. **Branch Integrity Rule (MANDATORY)**:
  - [ ] Before every commit and push, run `git branch --show-current`.
  - [ ] Commit and push must happen on the same branch currently being worked for that plan block.
  - [ ] If branch identity does not match the intended working branch, stop and correct branch context before committing.

## Review Gate (Before Finished)

A plan must enter `inReview/` before it can be moved to `finished/`.

In `reviewing/`, create:

1. A verification checklist file (for example: `verification-checklist-YYYY-MM-DD.md`) with checkbox items.
2. If any item fails, a review log file (for example: `review-log-YYYY-MM-DD.md`) documenting:
   - Failed check
   - Reproduction steps
   - Root cause (if known)
   - Fix applied
   - Re-test result

Only move a plan to `finished/` when required checklist items are all checked.

## Minimal Workflow

1. Create plan in `todo/` with required structure.
2. Move to `active/` when implementation starts.
3. Keep roadmap and phase files synchronized during execution.
4. Move to `inReview/` and execute checklist in `reviewing/`.
5. Log failures and fixes in review logs.
6. Move to `finished/` once all required checks pass.

## Naming Conventions (Recommended)

- Plan folder: kebab-case concise topic (`firestore-collections-reorganization`)
- Phase files: `phase-XX-topic-status.md`
- Review checklist: `verification-checklist-YYYY-MM-DD.md`
- Review log: `review-log-YYYY-MM-DD.md`
