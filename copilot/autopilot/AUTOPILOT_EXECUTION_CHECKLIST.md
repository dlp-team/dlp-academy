# Autopilot Execution Checklist

**Purpose:** Step-by-step checklist ensuring autopilot follows ALL required steps in correct order. Nothing is skipped.

**Start here before every autopilot task.** Follow in sequence. Do NOT skip steps.

---

## ✅ PRE-EXECUTION PHASE

### Step 0: Task Clarification

- [ ] **IF ambiguous:** Use `vscode/askQuestions` to clarify scope, constraints, expected outcomes
- [ ] **Document clarifications** in session memory `/memories/session/`
- [ ] **DO NOT proceed** until task scope is 100% clear
- [ ] Scope confirmed? → Continue to Step 1

---

## ✅ SETUP PHASE (BEFORE ANY CODE CHANGES)

### Step 1: Read Framework Documents

- [ ] Read: `copilot/autopilot/README.md` (command authorization overview)
- [ ] Read: `copilot/autopilot/git-workflow-rules.md` (git discipline)
- [ ] Read: `.github/copilot-instructions.md` (premium request standards)
- [ ] Read: `copilot/protocols/lossless-change-protocol.md` (zero regression)
- [ ] Skim: `.github/instructions/` (any domain-specific rules for this task)

### Step 2: Git Branch Status Check

- [ ] Run: `git branch --show-current`
- [ ] IF on `main`: **STOP** → Create new branch (see Step 3a)
- [ ] IF on feature branch: Continue to Step 4 (Step 3b)

### Step 3a: CREATE NEW FEATURE BRANCH (if on main)

- [ ] Run: `git checkout -b feature/<task-name-with-date>`
- [ ] Example format: `feature/firestore-migration-2026-0406`
- [ ] Continue to Step 3b

### Step 3b: REGISTER BRANCH IN BRANCHES_STATUS.md (MANDATORY FOR NEW BRANCHES)

- [ ] Run: `git fetch origin && git checkout development`
- [ ] Edit: `copilot/BRANCHES_STATUS.md`
- [ ] Add new row: Branch Name | Owner | Type | Status | Summary | Plan | Files | Date | Notes
- [ ] Run: `git add copilot/BRANCHES_STATUS.md`
- [ ] Run: `git commit -m "chore(branches): register feature/pc<id>/<name>"`
- [ ] Run: `git push origin development`
- [ ] Run: `git checkout feature/<task-name>` (return to feature branch)
- [ ] Continue to Step 4

### Step 4: Load Task-Specific Context

- [ ] Check: `copilot/plans/active/` for related plans
- [ ] Check: `copilot/explanations/codebase/` for relevant context
- [ ] Search: Codebase for similar patterns (use semantic_search if needed)
- [ ] Identify: All files that will be touched
- [ ] Document: Behaviors that MUST be preserved
- [ ] Ready to implement? → Continue to Step 5

---

## ✅ IMPLEMENTATION PHASE (FOR EACH MAJOR FEATURE BLOCK)

### Step 5: Implement Core Changes

- [ ] Make **surgical, minimal changes only** (lossless protocol)
- [ ] Preserve all props, handlers, states not explicitly mentioned
- [ ] No scope drift or "while we're here" improvements
- [ ] Apply code organization standards:
  - [ ] Check if any file exceeds 500 lines (if yes, document in review report why)
  - [ ] Extract reusable utilities to `src/utils/` (don't duplicate)
  - [ ] Place custom hooks in `src/hooks/` (don't inline)
  - [ ] No parallel JS/JSX and TS/TSX files (TypeScript-first only)
- [ ] Features implemented? → Continue to Step 6

### Step 6: Validation with get_errors

- [ ] Run: `get_errors` on all touched files
- [ ] Fix any errors found
- [ ] Verify: Requested behavior works
- [ ] Verify: Adjacent behaviors still work (grid/list/tree/shared modes)
- [ ] Verify: Empty/loading/error states render correctly
- [ ] Verify: Permission/visibility rules unchanged
- [ ] All adjacent behaviors verified? → Continue to Step 7

### Step 7: Create Lossless Review Report

- [ ] Create file: `copilot/explanations/temporal/lossless-reports/$(date +%Y-%m-%d)/<task-name>.md`
- [ ] Include sections:
  - [ ] Requested scope (exactly what was asked)
  - [ ] Out-of-scope behaviors explicitly preserved
  - [ ] Touched files list (full paths)
  - [ ] Per-file verification (concrete checks done for each file)
  - [ ] File organization reasoning (file size decisions, extraction rationale)
  - [ ] Risks found + how checked
  - [ ] Validation summary (get_errors results + runtime checks)
- [ ] Report created? → Continue to Step 8

### Step 8: Security Scan (MANDATORY BEFORE COMMIT)

- [ ] Run: `npm run security:scan:staged`
- [ ] **MUST see:** "Credential scan passed"
- [ ] Run: `git check-ignore -v .env`
- [ ] **MUST see:** `.env` is ignored
- [ ] Scans passed? → Continue to Step 9
- [ ] If ANY credentials found: **STOP** → Notify user immediately

### Step 9: Stage & Commit (SCOPED)

- [ ] Run: `git add <file1> <file2> <file3>` (SCOPED, NOT `git add .`)
- [ ] Run: `git commit -m "<type>(<scope>): <subject>"`
  - [ ] Format: `feat(scope): add xyz feature`
  - [ ] No period at end, imperative mood, max 50 chars
- [ ] Commit created? → Continue to Step 10

### Step 10: Security Scan Branch (MANDATORY BEFORE PUSH)

- [ ] Run: `npm run security:scan:branch`
- [ ] **MUST see:** "Credential scan passed"
- [ ] If ANY credentials found: **STOP** → Notify user immediately

### Step 11: Push to Feature Branch

- [ ] Run: `git push origin <branch-name>`
- [ ] Verify pushed successfully
- [ ] Branch pushed? → Continue to Step 12

### Step 12: Run Full Validation Suite

- [ ] Run: `npm run test` (all tests must pass)
- [ ] Run: `npm run lint` (0 errors in changed files)
- [ ] Run: `npm run build` (if modifying configs)
- [ ] All tests pass? → Continue to Step 13
- [ ] Tests fail? → Fix and repeat Steps 5-12 for that fix
  - [ ] Failed 3x on same issue? → **STOP** → Ask user for direction

### Step 13: Update Explanation Files

- [ ] Update: `copilot/explanations/codebase/` matching docs (append changelog entries)
- [ ] Create: Temporal explanation if session-specific
- [ ] Log manual user actions if applicable in: `copilot/user-action-notes.md`

### Step 14: Self-Response Loop - Continue or Verify?

- [ ] Execute: `vscode/askQuestions`
  - Header: `task-progress`
  - Question: "Continue with next feature block or run final verification?"
  - Options: ["Continue working", "Run final verification"]
- [ ] On "Continue working": → Go back to Step 5 (next feature block)
- [ ] On "Run final verification": → Go to Step 15
- [ ] **Loop repeats until 100% task complete**

---

## ✅ FINAL VERIFICATION PHASE

### Step 15: Test Generation (If New Components/Features Created)

- [ ] IF created new component/utility/feature:
  - [ ] Create test file in `tests/` matching structure
  - [ ] Run: `npm run test -- <new-test-file>`
  - [ ] Tests must pass
- [ ] Skip if no new components created

### Step 16: Final Verification via vscode/askQuestions

- [ ] Execute: `vscode/askQuestions` with comprehensive checklist
  - [ ] Confirm ALL items below:
    - [ ] All requested features implemented and working
    - [ ] All existing functionality preserved (lossless)
    - [ ] All tests passing (`npm run test` ✅)
    - [ ] All linting passing (`npm run lint` ✅)
    - [ ] All documentation updated
    - [ ] All Git commits pushed to branch
    - [ ] Code review ready (clean history, messages)
    - [ ] No console.log debug statements
    - [ ] All Spanish text verified for proper grammar
    - [ ] File path comments added to new files
- [ ] UI displays all checkboxes → **User confirms all checked** → Continue to Step 17

### Step 17: Definition of Done Verification

- [ ] ✅ All tests passing (`npm run test` clean)
- [ ] ✅ New features have test coverage
- [ ] ✅ No console.log statements remain
- [ ] ✅ All Spanish text verified for grammar
- [ ] ✅ No emojis in UI (icons only)
- [ ] ✅ TypeScript-first respected (no JS/JSX duplicates)
- [ ] ✅ File paths commented at top of all touched files
- [ ] ✅ Manual user actions in user-action-notes.md or marked none
- [ ] ✅ Commit/push cadence gate respected (all work committed and pushed)
- [ ] ✅ Lossless report created and contains all required sections

### Step 18: Leverage Step (MANDATORY - NO EXCEPTIONS)

- [ ] Execute: `vscode/askQuestions` (final gate before closure)
- [ ] Question: Concise confirmation of task completion status
- [ ] Options: ["Yes, close task" / "Hold for review" / "Continue"]
- [ ] **MANDATORY:** This step is CRITICAL and has NO EXCEPTIONS
- [ ] See protocol: `copilot/protocols/vscode-askQuestions-leverage-step.md`
- [ ] User confirms? → Continue to Step 19
- [ ] Tool fails? → Document failure, request user direction, DO NOT proceed

---

## ✅ CLOSURE PHASE

### Step 19: Task Closure

- [ ] All verification steps completed
- [ ] All checklists confirmed
- [ ] All tests passing
- [ ] All documentation updated
- [ ] All commits pushed
- [ ] Final leverage question answered affirmatively
- [ ] **CALL task_complete() with summary**

---

## 🚫 ABORT CONDITIONS (STOP IMMEDIATELY IF ENCOUNTERED)

1. **Branch detection:** ON `main` before creating feature branch → **STOP & CREATE BRANCH**
2. **Security breach:** ANY credentials found → **STOP & NOTIFY USER**
3. **Test failure 3x:** Same test failure on 3rd attempt → **STOP & ASK USER**
4. **Tool failure:** `vscode/askQuestions` fails → **DOCUMENT & REQUEST DIRECTION**
5. **Missing scope:** Task unclear after initial attempt → **STOP & CLARIFY**

---

## 📋 QUICK REFERENCE

| Phase | Steps | Duration | Gate |
|---|---|---|---|
| Pre-Execution | 0 | Quick | Scope clear? |
| Setup | 1-4 | 5 min | Branch ready, context loaded |
| Implementation | 5-14 | Variable | Self-response loop until complete |
| Final Verification | 15-18 | 10 min | All checklists passed |
| Closure | 19 | Instant | task_complete() called |

---

## 🔗 RELATED DOCUMENTS

- **Lossless Protocol:** [copilot/protocols/lossless-change-protocol.md](../protocols/lossless-change-protocol.md)
- **Git Workflow:** [copilot/autopilot/git-workflow-rules.md](../autopilot/git-workflow-rules.md)
- **Leverage Step Protocol:** [copilot/protocols/vscode-askQuestions-leverage-step.md](../protocols/vscode-askQuestions-leverage-step.md)
- **Command Authorization:** [copilot/autopilot/README.md](../autopilot/README.md)
- **Premium Standards:** [.github/copilot-instructions.md](../../.github/copilot-instructions.md)

---

**Version:** 1.0  
**Date Created:** April 6, 2026  
**Status:** ACTIVE  
**Use Cases:** All autopilot tasks, multi-agent work, complex features
