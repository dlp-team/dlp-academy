---
# .github/skills/merge-workflow/SKILL.md
name: merge-workflow
description: Execute strict, protocol-compliant branch merge workflows. Covers pre-merge sync, conflict resolution, PR creation, human-authorized merge gate, BRANCHES_STATUS.md update, BRANCH_LOG.md cleanup, and expired branch cleanup. Use when merging any feature branch into its parent.
---

# Merge Workflow Skill

## Objective

Perform safe, auditable, zero-data-loss merges of feature branches into their parent branches following the exact protocol from the Autopilot Execution Checklist (Steps 17-22.5). **Every step is mandatory. Skipping any step is a protocol violation.**

## Why This Skill Exists

Merges are **high-risk operations** that can cause:
- Loss of code if branches are deleted prematurely
- Pollution of `development` with branch-specific metadata (`BRANCH_LOG.md`)
- Stale entries in `BRANCHES_STATUS.md` causing confusion for other agents
- Merge conflicts that silently drop changes
- Unauthorized merges bypassing human approval

**This skill eliminates those risks through strict sequential execution.**

---

## CRITICAL RULES (NON-NEGOTIABLE)

1. **NEVER merge without human approval** when `Autopilot Status: true` in `BRANCH_LOG.md`
2. **NEVER merge to a branch other than `parent-branch`** declared in `BRANCH_LOG.md`
3. **ALWAYS update `BRANCHES_STATUS.md` on `development`** after merge
4. **ALWAYS delete `BRANCH_LOG.md` from `development`** if it lands there via merge
5. **ALWAYS run security scans** before any push during merge flow
6. **NEVER force-push** during merge operations
7. **NEVER skip conflict resolution** — resolve every conflict explicitly

---

## Pre-Merge Checklist (Gate Before Starting)

Before invoking ANY merge step, verify ALL of these:

- [ ] All implementation work is complete and validated
- [ ] All tests pass (`npm run test:unit`, `npm run test:rules`)
- [ ] All commits are pushed to the feature branch
- [ ] `BRANCH_LOG.md` exists and has current metadata
- [ ] `Merge Status` field exists in `BRANCH_LOG.md`
- [ ] You know the exact `parent-branch` from `BRANCH_LOG.md`

If ANY item is not satisfied, **STOP** and complete it before proceeding.

---

## Step-by-Step Merge Protocol

### STEP M1: Pre-Merge Synchronization

**Purpose:** Ensure the feature branch is up-to-date with its parent before merging.

```
ACTION SEQUENCE:
1. git fetch origin
2. Read BRANCH_LOG.md → capture `parent-branch` value
3. git pull origin <parent-branch>   (pull parent INTO feature branch)
4. Check for merge conflicts
```

**Decision gate:**
- IF conflicts detected → Go to STEP M2
- IF no conflicts → Skip to STEP M3

**HARD STOP if:**
- `parent-branch` is not set in `BRANCH_LOG.md`
- Current branch is `main` or `development` (you should be on the feature branch)

---

### STEP M2: Conflict Resolution

**Purpose:** Resolve all merge conflicts surgically before proceeding.

**COMPLEXITY ASSESSMENT (MANDATORY FIRST):**
Before attempting any resolution, assess conflict complexity:
```
1. git diff --name-only --diff-filter=U    (list conflicted files)
2. Count total conflicted files
3. For each file, estimate conflict severity:
   - TRIVIAL: whitespace, import ordering, auto-generated content
   - MODERATE: non-overlapping logic changes in same file
   - COMPLEX: overlapping logic, renamed/moved code, structural rewrites
   - CRITICAL: security rules, auth logic, database schemas, config files
```

**ABORT THRESHOLDS (HARD STOPS — ask user before proceeding):**
- More than 10 conflicted files total
- ANY file rated CRITICAL has conflicts
- More than 3 files rated COMPLEX
- Conflicts span both source code AND test files (high regression risk)
- Conflicts involve files you did NOT touch in the feature branch (unexpected divergence)
- You are not confident you understand the intent of BOTH sides of any conflict
- Total conflict markers (<<<<<<) across all files exceed 20

**If complexity is within acceptable bounds, proceed:**
```
ACTION SEQUENCE:
1. For EACH conflicted file:
   a. Read the file and analyze conflict markers (<<<<<<< / ======= / >>>>>>>)
   b. Resolve logically based on code structure and intent
   c. If both changes are valid: combine them strategically
   d. If unclear on ANY single conflict: STOP and ask the user
2. git add <all-resolved-files>
3. npm run security:scan:staged    (MANDATORY before commit)
4. git commit -m "chore(merge): resolve conflicts with <parent-branch>"
5. git push origin <feature-branch>
```

**HARD STOP if:**
- Complexity assessment exceeds any abort threshold above
- Any conflict cannot be resolved with confidence
- Security scan finds credentials in staged files
- After resolution, tests fail and the cause is unclear

---

### STEP M3: Validate Post-Sync State

**Purpose:** Confirm everything still works after pulling parent changes.

```
ACTION SEQUENCE:
1. npm run test:unit     (all tests must pass)
2. npm run lint          (no new lint errors)
3. get_errors            (no compile errors in touched files)
```

**Decision gate:**
- IF all pass → Continue to STEP M4
- IF any fail → Fix on feature branch, commit, push, then re-validate

---

### STEP M4: Update BRANCH_LOG.md for Merge Readiness

**Purpose:** Signal that the branch is ready for merge review.

```
ACTION SEQUENCE:
1. Read BRANCH_LOG.md
2. Update fields:
   - Current Step: 17 (or higher if already past)
   - Status: "ready-for-merge"
   - Merge Status: "pending-human-approval" (unless already explicitly approved by human)
3. git add BRANCH_LOG.md
4. git commit -m "docs(branch-log): ready for merge - pending human approval"
5. git push origin <feature-branch>
```

**CRITICAL:** Do NOT set `merge-permission: approved` yourself. Only a human can approve.

---

### STEP M5: Create Pull Request

**Purpose:** Create a PR targeting the correct parent branch.

**PRE-REQUISITE CHECK:**
```
1. Verify gh CLI is available: gh --version
2. IF gh is not installed or not authenticated:
   a. Log to PENDING_COMMANDS.md: "gh pr create requires GitHub CLI"
   b. Ask user to create PR manually via GitHub UI
   c. User provides PR URL → continue to STEP M6
```

```
ACTION SEQUENCE:
1. Read parent-branch from BRANCH_LOG.md
2. gh pr create --base <parent-branch> --title "<type>: <description>" --body "$(cat BRANCH_LOG.md)"
3. Verify PR base EXACTLY matches parent-branch
```

**HARD STOP if:**
- PR base does not match `parent-branch` from `BRANCH_LOG.md`
- PR creation fails (log error, ask user)

**If PR already exists:** Skip creation. Verify existing PR targets correct base.

---

### STEP M6: Validate PR (Tests & Checks)

**Purpose:** Ensure CI/CD passes on the PR.

```
ACTION SEQUENCE:
1. Wait for GitHub Actions / automated checks
2. IF checks pass → Continue to STEP M7
3. IF checks fail:
   a. Analyze failure
   b. Fix on feature branch
   c. git push origin <feature-branch>
   d. Wait for re-run
   e. Repeat until green (max 3 attempts, then STOP and ask user)
```

---

### STEP M7: Human-Authorized Merge Gate (CRITICAL)

**Purpose:** Ensure no merge happens without explicit human authorization.

```
MANDATORY CHECKS (ALL must pass):
1. Read BRANCH_LOG.md merge metadata
2. Capture parent-branch value
3. Verify PR base branch == parent-branch
4. Check Autopilot Status field:
   - IF autopilot-active: true → DO NOT use vscode/askQuestions to request merge
   - IF autopilot-active: true → Merge is BLOCKED until Merge Status is approved by human
5. Check Merge Status field:
   - IF merge-permission: approved AND human approver metadata exists → PROCEED to merge
   - IF merge-permission: pending-human-approval → STOP. Wait for human update in BRANCH_LOG.md
   - IF merge-permission: denied → STOP. Do not attempt merge.
```

**When approved (and ONLY when approved):**
```
ACTION SEQUENCE:
1. gh pr merge --squash --delete-branch
2. git checkout <parent-branch>
3. git pull origin <parent-branch>
```

**Post-merge BRANCH_LOG.md cleanup (MANDATORY for ALL parent branches):**
```
After merging into ANY parent branch:
  1. git checkout <parent-branch>
  2. git pull origin <parent-branch>
  3. Test-Path BRANCH_LOG.md
  4. IF exists AND it belongs to the merged feature branch (not the parent's own log):
     a. git rm BRANCH_LOG.md
     b. ALSO check for BRANCH_LOG_*.md variants → delete them too
     c. git commit -m "chore(cleanup): remove BRANCH_LOG.md from <parent-branch> after merge"
     d. git push origin <parent-branch>
  5. IF parent-branch has its OWN BRANCH_LOG.md (different content/branch identity):
     a. Do NOT delete — it belongs to the parent branch
     b. Verify by checking "current-branch" field inside the file
```

**RATIONALE:** `BRANCH_LOG.md` is branch-specific metadata. If it lands on the parent via merge, it pollutes the parent with data that belongs to the feature branch only. This applies to ALL parent branches, not just `development`.

---

### STEP M8: Update BRANCHES_STATUS.md (MANDATORY — NEVER SKIP)

**Purpose:** Mark the merged branch as pending-delete in the global registry AND update plan lifecycle.

```
ACTION SEQUENCE:
1. git checkout development && git pull origin development
2. VERIFY BRANCH_LOG.md cleanup from STEP M7 was completed:
   a. Test-Path BRANCH_LOG.md
   b. IF still exists AND belongs to merged branch → delete now: git rm BRANCH_LOG.md && commit && push
3. Edit: copilot/BRANCHES_STATUS.md
4. Find the row for the merged branch
5. Update fields:
   - Status: pending-delete (NOT "merged", NOT "archived", NOT "completed")
   - Pending-Delete Date: Today's date (YYYY-MM-DD)
   - Notes: Append "Merged into <parent-branch> on <date>; will be auto-deleted on <date+7days>"
6. git add copilot/BRANCHES_STATUS.md
7. git commit -m "chore(branches): mark <branch-name> as pending-delete"
8. git push origin development
```

**PLAN LIFECYCLE UPDATE (if applicable):**
```
IF the merged branch had an associated plan in copilot/plans/active/:
  1. Move the plan folder from copilot/plans/active/ to copilot/plans/finished/
  2. Update the plan README.md status to FINISHED with completion date
  3. git add copilot/plans/
  4. git commit -m "docs(plans): move <plan-name> to finished after merge"
  5. git push origin development
```

**NOTE on parent-branch routing:** If `parent-branch` is NOT `development` (e.g., merging a child into a parent feature branch), you still MUST update `BRANCHES_STATUS.md` on `development`. Always checkout `development` for this step regardless of where the merge landed.

**THIS STEP IS THE MOST COMMONLY FORGOTTEN STEP.** If you skip it, the branch registry becomes stale and other agents make incorrect decisions based on outdated data.

**NEVER delete the row entirely** — keep it visible with `pending-delete` for the 7-day grace period.

---

### STEP M9: Cleanup Expired Branches (Automated Housekeeping)

**Purpose:** Delete branches that have exceeded the 7-day retention period.

```
ACTION SEQUENCE:
1. Read: copilot/BRANCHES_STATUS.md
2. Read: copilot/ACTIVE-GOVERNANCE/BRANCH_RETENTION_POLICY.md (default: 7 days)
3. For EACH row with Status == "pending-delete":
   a. Parse Pending-Delete Date
   b. Calculate: days_elapsed = today - pending_delete_date
   c. IF days_elapsed >= 7:
      - git push origin --delete <branch-name>
      - git branch -D <branch-name> (if local copy exists)
      - Remove row from BRANCHES_STATUS.md
      - Log to: copilot/ACTIVE-GOVERNANCE/branch-deletion-audit.log
      - Format: [YYYY-MM-DD] DELETED: <branch-name> (pending since <date>, <N> days elapsed)
   d. ELSE: Skip (still within grace period)
4. IF any branches deleted:
   a. git add copilot/BRANCHES_STATUS.md copilot/ACTIVE-GOVERNANCE/branch-deletion-audit.log
   b. git commit -m "chore(branches): cleanup expired pending-delete branches"
   c. git push origin development
```

**Special retention cases:**
- Status `retained` → NEVER auto-delete (skip entirely)
- Security-sensitive → Extended to 30 days
- Production hotfixes → Indefinite retention

---

## Merge Flow Summary Diagram

```
STEP M1: Sync with parent branch
    ↓
STEP M2: Resolve conflicts (if any)
    ↓
STEP M3: Validate tests/lint/errors
    ↓
STEP M4: Update BRANCH_LOG.md → ready-for-merge
    ↓
STEP M5: Create PR targeting parent-branch
    ↓
STEP M6: Wait for CI to pass
    ↓
STEP M7: Human approval gate → merge when approved
    ↓  (includes BRANCH_LOG.md cleanup on development)
STEP M8: Update BRANCHES_STATUS.md → pending-delete  ⚠️ NEVER SKIP
    ↓
STEP M9: Clean up expired branches
```

---

## Abort Conditions (STOP IMMEDIATELY)

| Condition | Action |
|-----------|--------|
| `parent-branch` not set in BRANCH_LOG.md | STOP — cannot determine merge target |
| PR base ≠ parent-branch | STOP — fix PR target first |
| Merge Status = `denied` | STOP — do not attempt |
| Autopilot = true AND Merge Status ≠ `approved` | STOP — wait for human |
| > 10 conflicted files | STOP — branch too divergent, ask user |
| > 3 COMPLEX conflicts or ANY CRITICAL conflict | STOP — too risky for autonomous resolution |
| Conflicts in files not touched by feature branch | STOP — unexpected divergence, ask user |
| > 20 total conflict markers across all files | STOP — too complex, ask user |
| Not confident about intent of both sides | STOP — ask user to clarify |
| Unresolvable merge conflicts | STOP — ask user |
| Security scan fails | STOP — remove credentials |
| Same test failure 3 times | STOP — log issue, ask user |
| On `main` branch | STOP — never merge to main |

---

## Post-Merge Verification Checklist

After completing ALL steps, verify:

- [ ] Feature branch has been deleted (by GitHub via `--delete-branch`)
- [ ] `development` has the merged code (`git log --oneline -5` on development)
- [ ] `BRANCH_LOG.md` does NOT exist on `development`
- [ ] `BRANCHES_STATUS.md` has the branch marked as `pending-delete` with correct date
- [ ] No stale local branches remain (`git branch -a` to verify)
- [ ] Parent branch tests still pass after merge

---

## Quick Reference: Files Touched During Merge

| File | Location | Action |
|------|----------|--------|
| `BRANCH_LOG.md` | Feature branch root | Read (parent-branch, merge status), update status, DELETE from development after merge |
| `copilot/BRANCHES_STATUS.md` | `development` branch | UPDATE: mark merged branch as `pending-delete` |
| `copilot/ACTIVE-GOVERNANCE/branch-deletion-audit.log` | `development` branch | APPEND: log any expired branch deletions |
| `copilot/ACTIVE-GOVERNANCE/BRANCH_RETENTION_POLICY.md` | `development` branch | READ: get retention days (default 7) |

---

## Common Mistakes This Skill Prevents

1. **Forgetting to update BRANCHES_STATUS.md** → Stale registry, other agents confused
2. **Leaving BRANCH_LOG.md on development** → Pollutes shared branch with feature metadata
3. **Merging to wrong branch** → Code lands in unexpected place
4. **Merging without human approval** → Unauthorized changes in shared branches
5. **Skipping conflict resolution** → Silent code loss
6. **Not running tests after sync** → Broken parent branch
7. **Force-pushing during merge** → Lost commit history
8. **Deleting branch row immediately** → No grace period for rollback
9. **Not updating plan lifecycle** → Plans stuck in `active/` after work is done
10. **BRANCH_LOG.md pollution on non-development parents** → Metadata leaks to parent feature branches

---

## Emergency Rollback Procedure

**If a regression is discovered after merge (within 7-day grace period):**

```
ROLLBACK SEQUENCE:
1. Identify the merge commit on the parent branch:
   git log --oneline --merges -10   (find the squash merge commit)
2. Verify the branch still exists (within 7-day pending-delete window):
   git branch -a | grep <branch-name>
3. Revert the merge commit on the parent branch:
   git checkout <parent-branch>
   git revert <merge-commit-hash> -m 1
   git push origin <parent-branch>
4. Update BRANCHES_STATUS.md:
   - Change Status from pending-delete back to active
   - Remove Pending-Delete Date
   - Add Notes: "Reverted on <date> due to <reason>. Needs re-work."
5. Re-checkout the feature branch (if still exists):
   git checkout <feature-branch>
6. Fix the issue on the feature branch
7. Re-run the full merge workflow from STEP M1
```

**If branch was already deleted (past 7-day window):**
```
1. git revert <merge-commit-hash> -m 1   (on parent branch)
2. Create a NEW branch from parent to re-implement the fix
3. Follow standard branch creation protocol (Steps 2-4 of AUTOPILOT_EXECUTION_CHECKLIST)
```

**NEVER use `git reset --hard` or `git push --force` to undo a merge.** Always use `git revert`.
