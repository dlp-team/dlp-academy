<!-- copilot/user-action-notes.md -->
# Copilot User Action Notes

## Purpose
Track manual actions that must be completed by the user outside automated code edits.

## Usage Rules
- Add a new entry in `OPEN` status when a task requires manual setup (for example `.env` values, external account creation, console settings, or third-party credentials).
- Include the exact action, why it is needed, and impact if skipped.
- Never write real secrets in this file. Use placeholders only.
- Move an item from `OPEN` to `RESOLVED` only after user confirmation.

## OPEN
- Date: 2026-04-08
- Related Task/Plan: copilot/plans/finished/autopilot-plan-execution-2026-04-08
- Status: OPEN
- Required Action:
  - Create a pull request from `feature/hector/autopilot-plan-execution-2026-0408` into `development`.
  - Merge the PR (squash preferred) after final review and delete the feature branch.
  - Confirm completion so lifecycle can move to pending-delete in branch registry.
- Why Needed:
  - Checklist Step 19-21 requires PR creation/merge, but local GitHub CLI (`gh`) is unavailable in this environment.
  - If skipped, branch lifecycle cannot advance to merged/pending-delete state.

## RESOLVED
- Date: 2026-04-06
- Related Task/Plan: copilot/plans/finished/copilot-vscode-efficiency-rollout-2026-04-06
- Status: RESOLVED
- Required Action:
  - Copy `.env.example` to `.env` at repo root.
  - Set `COPILOT_PC_ID` with your machine identity (example: `you`, `fellow`, `pc1`).
  - Keep `.env` local and never commit it.
- Why Needed:
  - Multi-agent branch ownership, branch claiming, and shared-session coordination depend on a unique local `COPILOT_PC_ID`.
  - If skipped, Copilot branch coordination can become ambiguous.
- Confirmation:
  - User confirmed completion during leverage-step validation.
- Safe Placeholder Example (if applicable):
  - `COPILOT_PC_ID=<set-by-user>`

## Entry Template
- Date: YYYY-MM-DD
- Related Task/Plan: <path or identifier>
- Status: OPEN | RESOLVED
- Required Action:
  - <exact user steps>
- Why Needed:
  - <reason and impact>
- Safe Placeholder Example (if applicable):
  - `E2E_TEST_USER_EMAIL=<set-by-user>`
  - `E2E_TEST_USER_PASSWORD=<set-by-user>`

