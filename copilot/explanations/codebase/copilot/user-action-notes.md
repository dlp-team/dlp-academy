<!-- copilot/explanations/codebase/copilot/user-action-notes.md -->
# user-action-notes.md Explanation

## File Purpose
`copilot/user-action-notes.md` tracks required manual user steps that cannot be safely automated.

## Current Behavior
- Maintains OPEN/RESOLVED workflow for required user actions.
- Requires date, related plan, exact manual steps, and impact rationale.
- Uses placeholders only; no secrets are stored.

## Changelog
### 2026-04-06
- Added OPEN action for local `.env` setup with `COPILOT_PC_ID`.
- Documented deployment impact if the setup is skipped.
