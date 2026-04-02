---
# .github/skills/git-workflow/SKILL.md
name: git-workflow
description: Execute safe branch, commit, and push workflows for this repository. Use when implementing changes that must be versioned and pushed with strict branch safety.
---

# Git Workflow Skill

## Objective
Keep git history clean, safe, and protocol-compliant. **Commits are logs of validated progress.**

## Rules
1. Never commit or push to `main`.
2. Use feature branches for scoped work.
3. Commit after logical work units using conventional format: `type(scope): subject`.
4. **Push frequently to maintain audit trail of progress** (target: 3-5 commits per phase for larger tasks).
5. Do not force-push.
6. **Each commit represents validated work** - tests run, linting passed, adjacent functionality verified BEFORE committing.

## Commit Frequency Philosophy

- **One commit per feature/component** (not one commit per phase)
- **Example for a "Payment Processing" phase**:
  - `feat(payment): Add payment form component` + validation
  - `feat(payment): Add payment service integration` + validation  
  - `test(payment): Add payment error handling tests` + pass
  - `refactor(payment): Extract payment utils to shared module` + validation
  - = 4 commits, full audit trail of progress

## 🔐 Security Scan BEFORE EVERY Commit (MANDATORY)

🚨 **CRITICAL**: NEVER hardcode ANY API key - even old, test, or example keys.
GitGuardian detects ALL API keys (AIza...), regardless of status or age.
**SOLUTION**: Use environment variables ONLY - `import.meta.env.VITE_FIREBASE_API_KEY`

**Alert**: Credentials leaked on April 2, 2026. This CANNOT happen again.

Before `git commit`:
1. **Scan for secrets in staged changes**:
   ```bash
   git diff --cached | grep -iE "AIza|private_key|password|secret|token"
   ```
   - MUST return ZERO matches
   - If matches found: `git reset` and DO NOT COMMIT

2. **Verify `.env` protection**: `git check-ignore -v .env` (must be ignored)

3. **Check build artifacts**: No `*-lint-*.json`, `*serviceAccount*.json` files

Before `git push`:
1. Final scan: `git diff origin/main..HEAD | grep -iE "AIza|private_key|password"`
   - MUST return ZERO matches

## Verification before EVERY push
- `git status` - Confirm clean working directory or staged changes are intentional
- `git branch --show-current` - MUST NOT return "main"
- Tests/validation relevant to scope MUST be complete BEFORE commit
- Linting must pass BEFORE commit
- No `console.log` or debug code in commit
- 🔐 **NO CREDENTIALS** (API keys, private keys, passwords, tokens)
- 🔐 **`.env` files MUST be ignored** by git

## Commit Message Format (MANDATORY)

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, perf, test, chore
Scope: Concise feature/area name (payment, auth, subject-perms, etc.)
Subject: Imperative, no period, max 50 chars

Examples:
- feat(payment): Add payment processing form
- test(subject-perms): Add permission validation tests
- fix(home-bin): Resolve ordering issue in delete recovery
- refactor(dashboard): Extract stats calculation to utils
```
