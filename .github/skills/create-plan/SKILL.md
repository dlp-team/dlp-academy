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
- `copilot/plans/<state>/<plan-name>/user-updates.md`

## User Update Channel (MANDATORY)
Every plan package must include `user-updates.md` as the user-editable intake file.

Minimum template:
- `## How to Use`
- `## Pending User Updates`
- `## Processed Updates`

Execution rule:
1. Before starting any implementation block for an active plan, read `user-updates.md`.
2. If new pending items exist, sync them into `README.md`, `strategy-roadmap.md`, and impacted phase files before coding.
3. Immediately after syncing those updates, move the handled entries from `Pending` to `Processed` with a dated log that lists the files where each update was integrated.
4. Do not start feature implementation for that block until steps 1-3 are complete.

## Mandatory Final Optimization Phase (NEW)
Every multi-phase plan must end with a dedicated final phase focused on deep optimization of all touched files.

Minimum required checklist for that final phase:
- Centralize/unify repeated or highly similar logic to reduce maintenance overhead.
- Split oversized files and improve module organization when file size/complexity justifies it.
- Improve readability (naming, structure, comments only where needed) without behavior drift.
- Apply efficiency improvements where safe and measurable.
- Run `npm run lint` and resolve all errors related to touched scope.
- Re-validate impacted tests after optimization changes.

Closure rule:
- A plan is not considered complete until this optimization phase is executed, validated, documented, and included in final review evidence.

## Lifecycle
1. Create in `todo/`.
2. Move to `active/` when implementation starts.
3. Keep roadmap, phase statuses, and `user-updates.md` synchronized.
4. Move to `inReview/` after implementation + validation.
5. Move to `finished/` after reviewer closure.

## Dual-Source Intake Rule (ORIGINAL_PLAN + GEMINI_PLAN)
When both source files exist for the same request (`copilot/plans/ORIGINAL_PLAN.md` and `copilot/plans/GEMINI_PLAN.md`), apply this flow without exception:

1. **Authority precedence**:
	- `ORIGINAL_PLAN.md` is the primary source of truth.
	- `GEMINI_PLAN.md` is secondary and can only improve structure/readability.
	- Never drop, weaken, or replace requirements present in the original user-authored file.

2. **Plan creation behavior**:
	- Create the new plan package first.
	- Move both source files into that new plan folder.
	- Rename both files to task-specific names to avoid future ambiguity, using this pattern:
	  - `source-original-user-spec-<plan-topic>.md`
	  - `source-gemini-structured-reference-<plan-topic>.md`

3. **Traceability requirements**:
	- Update plan `README.md` with explicit source-priority notes.
	- Ensure top-level duplicates (`copilot/plans/ORIGINAL_PLAN.md`, `copilot/plans/GEMINI_PLAN.md`) are not left behind.
	- If destination filenames already exist, append a date slug while preserving the naming pattern.

## Quality gates
- Include explicit scope and out-of-scope.
- Include rollback strategy and validation commands.
- Include residual risks and follow-ups before closure.
