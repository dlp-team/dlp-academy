---
# .github/skills/lossless-change/SKILL.md
name: lossless-change
description: Apply surgical, regression-safe modifications while preserving all non-requested behavior. Use when implementing fixes or features with strict no-regression requirements.
---

# Lossless Change Skill

## Objective
Deliver requested changes without hidden removals, behavior drift, or scope creep.

## Workflow
1. Restate exact requested scope and preserved behaviors.
2. Change only required files and symbols.
3. Preserve existing handlers, props, states, and fallback paths unless explicitly requested.
4. Run verification on touched and adjacent behavior.
5. Produce a lossless report in `copilot/explanations/temporal/lossless-reports/YYYY-MM-DD/`.

## Mandatory checks
- `get_errors` on touched files.
- Re-run impacted tests.
- Confirm no unrelated behavior regressions.
