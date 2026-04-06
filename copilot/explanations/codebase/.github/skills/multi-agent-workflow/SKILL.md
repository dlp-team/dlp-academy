<!-- copilot/explanations/codebase/.github/skills/multi-agent-workflow/SKILL.md -->
# multi-agent-workflow SKILL.md Explanation

## File Purpose
`.github/skills/multi-agent-workflow/SKILL.md` defines repository workflow behavior for zero-touch, multi-agent Git operations, branch ownership, and coordination safety.

## Current Behavior
- Requires `COPILOT_PC_ID` before work begins.
- Supports branch sharing modes (`locked` and `shared`) with explicit session coordination.
- Provides branch claiming semantics and merge/conflict handling policy.

## Changelog
### 2026-04-06
- Updated PC ID setup instructions to explicitly include `.env.example` bootstrap flow.
- Added PowerShell-friendly assignment and verification snippet for Windows operators.
- Preserved all existing branch coordination semantics and status conventions.
