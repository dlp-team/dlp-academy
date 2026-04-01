---
# .github/skills/create-plan/SKILL.md
name: create-plan
description: Create and execute protocol-compliant plans for multi-step work, migrations, risky refactors, and cross-module tasks. Use when asked to create a plan, roadmap, phases, or lifecycle transitions.
---

# Create Plan Skill

## Objective
Create complete plan artifacts and immediately start execution when requested.

## Required structure
- `copilot/plans/<state>/<plan-name>/README.md`
- `copilot/plans/<state>/<plan-name>/strategy-roadmap.md`
- `copilot/plans/<state>/<plan-name>/phases/*.md`
- `copilot/plans/<state>/<plan-name>/reviewing/*.md`
- `copilot/plans/<state>/<plan-name>/working/*.md`
- `copilot/plans/<state>/<plan-name>/subplans/README.md`

## Lifecycle
1. Create in `todo/`.
2. Move to `active/` when implementation starts.
3. Keep roadmap and phase statuses synchronized.
4. Move to `inReview/` after implementation + validation.
5. Move to `finished/` after reviewer closure.

## Quality gates
- Include explicit scope and out-of-scope.
- Include rollback strategy and validation commands.
- Include residual risks and follow-ups before closure.
