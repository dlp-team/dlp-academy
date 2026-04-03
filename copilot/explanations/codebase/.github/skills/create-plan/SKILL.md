<!-- copilot/explanations/codebase/.github/skills/create-plan/SKILL.md -->
# create-plan Skill Explanation

## File Purpose
`.github/skills/create-plan/SKILL.md` defines the workflow standards for generating and executing protocol-compliant plans in this repository.

## Core Responsibilities
- Enforce quality-first phase execution.
- Define required plan structure and lifecycle transitions.
- Define validation gates and anti-rush safeguards.

## Changelog
### 2026-04-03
- Added a mandatory dual-source intake rule for requests that include both `ORIGINAL_PLAN.md` and `GEMINI_PLAN.md`.
- Established precedence: `ORIGINAL_PLAN.md` is always authoritative.
- Added required relocation and task-specific renaming of both source files into the newly created plan folder.
- Added traceability requirements so source-priority notes are recorded in the plan `README.md` and root-level duplicate source files are not left behind.
