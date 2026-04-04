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
- None.

## RESOLVED
- None.

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
