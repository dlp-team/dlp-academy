---
# .github/skills/create-plan/SKILL.md
name: create-plan
description: Create and execute protocol-compliant plans for multi-step work, migrations, risky refactors, and cross-module tasks. Use when asked to create a plan, roadmap, phases, or lifecycle transitions.
---

# Create Plan Skill

## Objective
Create complete plan artifacts and immediately start execution when requested with **QUALITY-FIRST** discipline.

## 🎯 QUALITY-FIRST EXECUTION (NON-NEGOTIABLE)

**THIS SKILL PRIORITIZES CORRECTNESS AND THOROUGHNESS OVER SPEED.**

### For Every Phase Completion:

**1. Pre-Completion Double-Check (MANDATORY):**
- [ ] All phase objectives fully completed?
- [ ] Code follows DLP Academy patterns and conventions?
- [ ] All new code has corresponding tests?
- [ ] `npm run test` passes locally (actual run, not assumption)?
- [ ] `npm run lint` passes (0 errors related to changes)?
- [ ] `npx tsc --noEmit` checks passed?
- [ ] Adjacent functionality verified for regressions?
- [ ] Edge cases, empty states, error states tested?
- [ ] Lossless report documented (before/after, files touched)?

**2. Prevent Lazy Completion (ZERO TOLERANCE):**
- ❌ Do NOT mark a phase complete if tests haven't been run
- ❌ Do NOT mark complete because "I think it works"
- ❌ Do NOT skip validation steps to move faster
- ❌ Do NOT leave console.log or debug code
- ✅ ALWAYS run actual test commands before marking complete
- ✅ ALWAYS manually verify UI/functionality changes  
- ✅ ALWAYS check error/loading/empty states exist and work
- ✅ ALWAYS document exactly what you validated

**3. Git Commit & Push Frequency (REQUIRED):**
- Commit after every major component/hook/feature addition (not just at phase end)
- Commit after running validation steps
- Format: `<type>(<scope>): <subject>` per git-workflow-rules.md
- **Target: 3-5 commits per phase** (reflects incremental, validated progress)
- Push to feature branch: `git push origin <branch-name>`
- Never commit to `main` branch
- **Cadence gate**: Do NOT begin a new major work block until the previous validated block is both committed and pushed
- **No batching rule**: Never batch multiple validated major blocks into one delayed commit/push

**4. RED FLAGS - Stop Immediately If You Think This:**
- "Let me quickly move to the next phase..."
- "Tests probably pass, moving on"
- "Validation seems straightforward, I'll skip it"
- "This should work, I'm confident enough"
- **ACTION:** Stop, run tests, fix issues, document findings, then continue

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
