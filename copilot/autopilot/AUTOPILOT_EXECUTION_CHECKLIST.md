# Autopilot Execution Checklist - Multi-Agent Workflow

**Purpose:** Step-by-step checklist for autopilot following ALL required steps in correct sequence for multi-agent collaboration. Nothing is skipped.

**Start here before every autopilot task.** Follow in sequence. Do NOT skip steps.

---

## ✅ PRE-EXECUTION PHASE

### Step 0: Task Assessment & Analysis

- [ ] **Assess the work assigned**
  - [ ] What features/fixes/tasks are being requested?
  - [ ] What is the scope and expected outcomes?
  - [ ] What files/areas will be affected?
  - [ ] Is this a new feature, bug fix, refactor, or chore?
  - [ ] Are there any dependencies or prerequisites?
- [ ] **Document assessment** in session memory `/memories/session/`
- [ ] **Assessment complete** → Continue to Step 1

---

## ✅ BRANCH STRATEGY PHASE

### Step 1: Check Global Branch Registry (BRANCHES_STATUS.md)

- [ ] **Establish agent identity:**
  - [ ] Read local environment variable: `COPILOT_PC_ID`
  - [ ] Confirm value (e.g., `pc1`, `pc2`, etc.)
  - [ ] Use this value throughout workflow for branch ownership
- [ ] Run: `git fetch origin && git checkout development && git pull origin development`
- [ ] Read: `copilot/BRANCHES_STATUS.md` (lives on development branch)
- [ ] Analyze existing branches:
  - [ ] Which branches are active, paused, or complete?
  - [ ] What work is each branch doing?
  - [ ] Are any branches related to the current task?
  - [ ] Who owns each branch (pc_id)?
  - [ ] What is the current status of each?

### Step 2: Decide on Branch Strategy

**Decision tree:**

**Option A: Use Existing Related Branch**
- [ ] IF a branch exists that is:
  - [ ] Related to the current task scope
  - [ ] Owned by this pc_id OR has empty Status
  - [ ] NOT currently locked by another copilot
- [ ] Then: Git checkout that branch, pull latest, continue to Step 3b
- [ ] Otherwise: Continue to Option B or C

**Option B: Create New Branch from Development**
- [ ] IF task is independent and not related to any existing work
- [ ] Then: Create new feature branch:
  - [ ] Run: `git checkout -b feature/<this-pc-id>/<task-name>`
  - [ ] Example: `feature/pc1/create-overlay-component-2026-0406`
  - [ ] Continue to Step 3a

**Option C: Create New Branch from Existing Branch**
- [ ] IF task is a subtask or extension of related work on another branch
- [ ] AND that branch is not being worked by another copilot
- [ ] Then: Create new branch from that branch:
  - [ ] Run: `git checkout <parent-branch> && git pull origin <parent-branch>`
  - [ ] Run: `git checkout -b feature/<this-pc-id>/<subtask-name>`
  - [ ] Continue to Step 3a

### Step 3a: REGISTER NEW BRANCH IN BRANCHES_STATUS.md

- [ ] Return to development: `git checkout development && git pull origin development`
- [ ] Edit: `copilot/BRANCHES_STATUS.md`
- [ ] Add new row with:
  - [ ] Branch Name: `feature/<pc-id>/<task-name>`
  - [ ] Owner: `<pc-id>`
  - [ ] Type: `feature|fix|chore|experiment`
  - [ ] Lock Status: Choose ONE:
    - [ ] `locked-private` - Strictly isolated, only owner can modify (single-person work)
    - [ ] `locked-active` - Shared branch, actively being modified now (owner working, others blocked)
    - [ ] `unlocked-idle` - Shared branch at rest (any agent can claim by changing to locked-active)
  - [ ] Summary: Brief description of work
  - [ ] Plan Path: (will fill in after creating plan)
  - [ ] Files: (will fill in after implementation)
  - [ ] Date: Today's date
  - [ ] Notes: Any blockers or dependencies
- [ ] Commit & push:
  - [ ] `git add copilot/BRANCHES_STATUS.md`
  - [ ] `git commit -m "chore(branches): register feature/<pc-id>/<task-name>"`
  - [ ] `git push origin development`
- [ ] Return to feature branch: `git checkout feature/<pc-id>/<task-name>`
- [ ] Continue to Step 3b

### Step 3b: READ EXISTING BRANCH CONTEXT (if using existing branch)

- [ ] IF using an existing branch (from Option A), read branch-level context:
  - [ ] File: `BRANCH_LOG.md` at root of branch (or `copilot/branch-logs/BRANCH_LOG.md`)
  - [ ] Which plans are associated with this branch?
  - [ ] What work has already been completed?
  - [ ] What is the current status?
  - [ ] Are there any external comments or notes?
  - [ ] What files have been touched?
- [ ] Understand the existing work before proceeding
- [ ] Continue to Step 4

### Step 4: LOCK BRANCH & CREATE BRANCH_LOG.md

- [ ] Ensure on feature branch: `git branch --show-current` (must NOT be main or development)
- [ ] Create/update: `BRANCH_LOG.md` at root of branch
  - [ ] Metadata section:
    - [ ] Created/Updated: Today's date
    - [ ] Owner: `<this-pc-id>`
    - [ ] Lock Status: Match the value from Step 3a (locked-private, locked-active, or unlocked-idle)
    - [ ] Current Work: Brief summary of what will be done
  - [ ] Add section: "Related Plans" (will link to plans after creating them)
  - [ ] Add section: "Touched Files" (will fill in during implementation)
  - [ ] Add section: "External Comments" (for other copilots to leave notes)
  - [ ] Add section: "Merge Status" (empty for now)
- [ ] Commit & push the BRANCH_LOG.md immediately:
  - [ ] `git add BRANCH_LOG.md`
  - [ ] `git commit -m "chore(branch-log): lock ${BRANCH_NAME} for pc<id> - ${SUMMARY} [${LOCK_STATUS}]"`
  - [ ] `git push origin <feature-branch>`
- [ ] **Branch is now locked** (based on lock status) - other copilots will follow access rules
- [ ] Continue to Step 5

---

## ✅ IMPLEMENTATION PHASE (FOR EACH MAJOR FEATURE BLOCK)

### Step 5: Load Framework Documents & Task Context

- [ ] Read: `.github/copilot-instructions.md` (premium request standards)
- [ ] Read: `copilot/protocols/lossless-change-protocol.md` (zero regression)
- [ ] Read: `copilot/plans/active/` for any related plans
- [ ] Read: `copilot/explanations/codebase/` for relevant component patterns
- [ ] **Pre-flight sync check:**
  - [ ] `git fetch origin && git pull origin development` (get latest framework changes)
  - [ ] IF framework changes exist in `.github/`: Rebase or merge them into feature branch before coding
- [ ] Task context loaded? → Continue to Step 6

### Step 6: Create or Reference Plan

- [ ] IF multi-step feature: Create comprehensive plan
  - [ ] File: `copilot/plans/active/feature-name/README.md`
  - [ ] Include: Scope, roadmap, phases, validation gates
  - [ ] Set status: `active`
- [ ] IF single-step task: Create lightweight plan OR reference existing plan
- [ ] Update BRANCH_LOG.md:
  - [ ] Add plan path/reference under "Related Plans"
  - [ ] Commit: `git add BRANCH_LOG.md && git commit -m "docs(branch-log): link plan references"`
  - [ ] Push: `git push origin <feature-branch>`

### Step 7: Implement Core Changes

- [ ] Make **surgical, minimal changes only** (lossless protocol)
- [ ] Preserve all props, handlers, states not explicitly mentioned
- [ ] No scope drift or "while we're here" improvements
- [ ] Apply code organization standards:
  - [ ] Check if any file exceeds 500 lines (document in review report why)
  - [ ] Extract reusable utilities to `src/utils/`
  - [ ] Place custom hooks in `src/hooks/`
  - [ ] NO parallel JS/JSX and TS/TSX files
- [ ] Features implemented? → Continue to Step 8

### Step 8: Validation with get_errors

- [ ] Run: `get_errors` on all touched files
- [ ] Fix any errors found
- [ ] Verify: Requested behavior works
- [ ] Verify: Adjacent behaviors still work
- [ ] Verify: Empty/loading/error states render correctly
- [ ] Verify: Permission/visibility rules unchanged
- [ ] All validations passed? → Continue to Step 9

### Step 9: Create Lossless Review Report

- [ ] File: `copilot/explanations/temporal/lossless-reports/$(date +%Y-%m-%d)/<task-name>.md`
- [ ] Sections:
  - [ ] Requested scope
  - [ ] Out-of-scope behaviors preserved
  - [ ] Touched files list
  - [ ] Per-file verification (concrete checks)
  - [ ] File organization reasoning
  - [ ] Risks found + how checked
  - [ ] Validation summary
- [ ] Update BRANCH_LOG.md: Link lossless report
  - [ ] Commit & push immediately

### Step 10: Security Scan (MANDATORY BEFORE COMMIT)

- [ ] Run: `npm run security:scan:staged`
- [ ] **MUST see:** "Credential scan passed"
- [ ] Run: `git check-ignore -v .env` (must be ignored)
- [ ] Scans passed? → Continue to Step 11
- [ ] Credentials found? → **STOP** & notify user

### Step 11: Atomic Commit

- [ ] **Read Git Workflow Standards:**
  - [ ] Read: `.github/skills/git-workflow/SKILL.md` (ensures strict adherence to commit standards)
- [ ] Run: `git add <file1> <file2> <file3>` (SCOPED, NOT `git add .`)
- [ ] Run: `git commit -m "<type>(<scope>): <subject>"`
  - [ ] Format: `feat(overlay): Add create subject overlay`
  - [ ] No period, imperative mood, max 50 chars
  - [ ] Include body answering: What? Why? Watch-outs?
  - [ ] Reference git-workflow SKILL for domain-specific examples
- [ ] Commit created? → Continue to Step 12

### Step 12: Security Scan Branch (MANDATORY BEFORE PUSH)

- [ ] Run: `npm run security:scan:branch`
- [ ] **MUST see:** "Credential scan passed"
- [ ] If credentials found: **STOP** & notify
- [ ] Scans passed? → Continue to Step 13

### Step 13: Push to Feature Branch

- [ ] Run: `git push origin <branch-name>`
- [ ] Branch pushed? → Continue to Step 14

### Step 14: Run Full Validation Suite

- [ ] Run: `npm run test` (all tests must pass)
- [ ] Run: `npm run lint` (0 errors)
- [ ] Run: `npm run build` (if modifying configs)
- [ ] All tests pass? → Continue to Step 15
- [ ] Tests fail? → **READ ERROR OUTPUT FIRST**
  - [ ] Use `@terminal` context to read full error messages
  - [ ] Analyze the failure point (line numbers, assertion, stack trace)
  - [ ] Fix issue on feature branch
  - [ ] Repeat Steps 7-14
  - [ ] Failed 3x on same issue? → **STOP** & log issue for user review

### Step 15: Update Documentation & Branch Log

- [ ] Update: `copilot/explanations/codebase/` (append changelogs, no overwrites)
- [ ] Update: BRANCH_LOG.md with touched files and completion notes
- [ ] Log: `copilot/user-action-notes.md` if user action needed
- [ ] Commit: `git add BRANCH_LOG.md` & push

### Step 16: Self-Response Loop - Continue or Finalize?

- [ ] Ask internally: "Is there more work for this task?"
  - [ ] If YES: Go back to Step 7 (next feature block)
  - [ ] If NO: Continue to Step 17 (finalization)

---

## ✅ FINALIZATION PHASE

### Step 17: Pre-Merge Synchronization

- [ ] Run: `git fetch origin`
- [ ] Run: `git pull origin development` (into feature branch)
- [ ] Check for merge conflicts locally:
  - [ ] IF conflicts detected: Go to Step 18 (autonomous resolution)
  - [ ] IF no conflicts: Skip to Step 19

### Step 18: Autonomous Conflict Resolution

- [ ] Run: `git diff --name-only --diff-filter=U` (find conflicted files)
- [ ] For each conflicted file:
  - [ ] Read and analyze the conflict markers
  - [ ] Resolve logically based on code structure and intent
  - [ ] Choose the version that makes semantic sense
  - [ ] If unclear: Keep BOTH changes combined strategically
- [ ] After resolving all conflicts:
  - [ ] `git add <conflicted-files>`
  - [ ] `git commit -m "chore(merge): resolve conflicts with development"`
  - [ ] `git push origin <feature-branch>`

### Step 19: Create Pull Request (Autonomous)

- [ ] Use GitHub CLI:
  - [ ] `gh pr create --base development --title "feat: <brief description>" --body "$(cat BRANCH_LOG.md)"`
  - [ ] PR body includes BRANCH_LOG.md content (what was done, plans, references)
- [ ] PR created? → Continue to Step 20

### Step 20: Validate PR (Tests & Checks)

- [ ] Wait for Github Actions / automated tests to complete on PR
- [ ] IF tests pass: Continue to Step 21
- [ ] IF tests fail:
  - [ ] Analyze failure
  - [ ] Fix issue on feature branch
  - [ ] Push fix
  - [ ] Checks re-run
  - [ ] Repeat until green

### Step 21: Autonomous Merge Decision

- [ ] Check PR status:
  - [ ] IF all checks green AND no merge conflicts: Proceed with merge
  - [ ] IF merge conflicts exist: Go back to Step 18 (resolve manually)
- [ ] Run: `gh pr merge --squash --delete-branch` (merge and clean up)
- [ ] **After merge, return to development branch:**
  - [ ] `git checkout development`
  - [ ] (Feature branch deleted by GitHub; local checkout prevents being in deleted branch)
- [ ] Branch merged & deleted automatically

### Step 22: Update BRANCHES_STATUS.md

- [ ] Checkout development: `git checkout development && git pull origin development`
- [ ] Edit: `copilot/BRANCHES_STATUS.md`
- [ ] Find row for the merged branch and update:
  - [ ] Status: `merged`
  - [ ] Lock Status: `unlocked-idle` (branch is available for reuse if needed)
  - [ ] Date: Today's date
  - [ ] Notes: "Merged into development on [date]"
  - [ ] **Decision:** Keep row in BRANCHES_STATUS.md for historical reference OR delete if repo prefers clean registry
    - [ ] If KEEPING: Mark as merged with date
    - [ ] If DELETING: Remove row entirely (preferred for active branches only)
- [ ] Commit & push:
  - [ ] `git add copilot/BRANCHES_STATUS.md`
  - [ ] `git commit -m "chore(branches): mark/remove feature/<pc-id>/<task> as merged"`
  - [ ] `git push origin development`
- [ ] Continue to Step 23

### Step 23: Final Verification & Leverage Question

- [ ] Execute: `vscode/askQuestions` (FINAL GATE - MANDATORY)
- [ ] Question: "All work complete, tests passing, PR merged. Close task?"
- [ ] Options:  - [ ] "Yes, close" → Continue to Step 24
  - [ ] "Hold for review" → Document and wait for user
  - [ ] "Continue" → Ask what else needs doing
- [ ] User confirms closure? → Continue to Step 24
- [ ] Tool fails? → Document failure, request user direction

### Step 24: Task Closure

- [ ] Final status check:
  - [ ] All features implemented & working
  - [ ] All tests passing
  - [ ] All documentation updated
  - [ ] All commits pushed
  - [ ] Branch merged into development
  - [ ] BRANCHES_STATUS.md updated
  - [ ] Leverage question answered affirmatively
- [ ] **CALL task_complete()**

---

## 🚫 ABORT CONDITIONS (STOP IMMEDIATELY)

1. **Wrong branch:** On `main` before feature branch created → CREATE FEATURE BRANCH
2. **Security breach:** Credentials found → STOP & NOTIFY USER
3. **Test failure 3x:** Same failure on 3rd attempt → STOP & LOG ISSUE
4. **Merge conflict unresolvable:** Cannot logically resolve → LOG & REQUEST DIRECTION
5. **Framework mismatch:** `.github/` differs from development → REBASE/MERGE before coding

---

## 📋 QUICK REFERENCE

| Phase | Steps | Purpose | Gate |
|---|---|---|---|
| Pre-Execution | 0 | Assess task scope and work | Assessment complete |
| Branch Strategy | 1-4 | Decide branch, lock it | Branch locked with pc_id |
| Load Context | 5-6 | Load frameworks, create plan | Context ready |
| Implementation | 7-16 | Implement, validate, commit, push | Tests green |
| Finalization | 17-22 | Merge, sync status | Merged into development |
| Closure | 23-24 | Final question, task_complete() | User confirms |

---

## 🔑 KEY FILES

- **Global registry:** `copilot/BRANCHES_STATUS.md` (on development branch)
- **Branch memory:** `BRANCH_LOG.md` (at root of feature branch)
- **Plans:** `copilot/plans/active/<plan-name>/`
- **Lossless reports:** `copilot/explanations/temporal/lossless-reports/`
- **Framework:** `.github/copilot-instructions.md`, `.github/instructions/*`

---

## 🔗 RELATED DOCUMENTS

- **Multi-Agent Workflow Skill:** `.github/skills/multi-agent-workflow/SKILL.md`
- **Lossless Protocol:** `copilot/protocols/lossless-change-protocol.md`
- **Git Workflow:** `copilot/autopilot/git-workflow-rules.md`
- **Leverage Step Protocol:** `copilot/protocols/vscode-askQuestions-leverage-step.md`
- **Command Authorization:** `copilot/autopilot/README.md`
- **Premium Standards:** `.github/copilot-instructions.md`

---

**Version:** 2.0 (Multi-Agent Workflow)  
**Date Updated:** April 6, 2026  
**Status:** ACTIVE  
**Use Cases:** All autopilot tasks in multi-agent environments
