// copilot-instructions.md

# vscode/askQuestions Leverage Step Enforcement (Critical)

## Mandatory Rule
The agent MUST ALWAYS execute the `vscode/askQuestions` leverage step before completing any premium request. This protocol supersedes all other completion logic and is enforced in every completion flow.

## Enforcement
- Applies to all agent modes and workflows.
- If the tool fails, the agent must document the failure and request user direction before ending the session.
- No exceptions: This step is mandatory for all premium completions.
- Document enforcement in lossless reports and explanations.

## Date Enforced
March 12, 2026

---

## Changelog
- 2026-03-12: Enforcement protocol added to copilot-instructions.md.
- 2026-04-06: Added a concise Copilot Efficiency Operating Model covering session discipline, context budget controls, instruction layering, model/task routing, and observability loop.
- 2026-04-06: Compacted duplicate leverage-enforcement line and added deterministic routing references to `copilot/COPILOT_AGENTIC_EXECUTION_ROUTING_2026-04-06.md` and `copilot/autopilot/COMMAND_APPROVAL_MATRIX.md`.
