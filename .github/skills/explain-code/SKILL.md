---
# .github/skills/explain-code/SKILL.md
name: explain-code
description: Update or create codebase and temporal explanation files after implementation changes. Use when documenting architecture, behavior changes, and changelog entries.
---

# Explain Code Skill

## Objective
Keep explanation docs synchronized with real code changes.

## Targets
- Permanent mirror docs: `copilot/explanations/codebase/`
- Session/task docs: `copilot/explanations/temporal/`

## Workflow
1. Identify touched source/test files.
2. Update matching codebase explanation docs.
3. Append dated changelog entries; do not overwrite historical notes.
4. Add temporal notes when task-specific before/after context is useful.
5. Ensure wording reflects actual merged behavior.
