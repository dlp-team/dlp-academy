---
# .github/skills/git-workflow/SKILL.md
name: git-workflow
description: Execute safe branch, commit, and push workflows for this repository. Use when implementing changes that must be versioned and pushed with strict branch safety.
---

# Git Workflow Skill

## Objective
Keep git history clean, safe, and protocol-compliant.

## Rules
1. Never commit or push to `main`.
2. Use feature branches for scoped work.
3. Commit after logical work units using conventional format: `type(scope): subject`.
4. Push frequently to avoid large unreviewed batches.
5. Do not force-push.

## Verification before push
- `git status`
- `git branch --show-current`
- Confirm tests/validation relevant to scope are complete.
