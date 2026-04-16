<!-- copilot/ACTIVE-GOVERNANCE/git-workflow-rules.md -->
# Autopilot Git Workflow Rules (Required for All Autopilot Tasks)

## 🚫 CRITICAL GIT RESTRICTIONS

### Main Branch Protection (ABSOLUTE)
- **NEVER push to `main` branch** - This is categorically forbidden
- **NEVER commit directly to `main` - Always use a feature branch**
- If autopilot detects it is on `main`, STOP and create a new branch immediately

### Branch Ownership Protection (ABSOLUTE)
- **ALWAYS resolve `COPILOT_PC_ID` before any file change**
- **ALWAYS verify the current branch owner matches `COPILOT_PC_ID`** in both:
   - `copilot/BRANCHES_STATUS.md` (global registry)
   - `BRANCH_LOG.md` (branch-local ownership)
- If `COPILOT_PC_ID` is missing/empty, **STOP IMMEDIATELY**
- If owner mismatch is detected, **STOP IMMEDIATELY** (no edits, no commits)

---

## 🔄 Git Workflow for Autopilot (MANDATORY)

### Step 1: Branch & Permission Gate (BEFORE ANY FILE CHANGE)
```bash
git branch --show-current
```
**Purpose**: Determine current branch, identity, and write permission before work starts:
- Resolve `COPILOT_PC_ID` from local environment
- If missing/empty → STOP
- Verify branch owner in `copilot/BRANCHES_STATUS.md` matches `COPILOT_PC_ID`
- Verify owner in `BRANCH_LOG.md` matches `COPILOT_PC_ID` (if file exists)
- If any mismatch → STOP
- If on `main` → **CREATE NEW BRANCH** (see Step 2)
- If on feature branch and ownership matches → continue

### Step 1b: Plan Isolation Gate (MANDATORY)
**When to use**:
- Current branch is a feature branch
- Current branch parent is `development`
- A new plan (new package under `copilot/plans/`) is requested

**Rule**:
- Do NOT execute the new plan on the current branch
- Create a child branch from the current branch and run the new plan there
- Record the current branch as `parent-branch` in the child `BRANCH_LOG.md`
- Merge child branch back into the parent branch when complete

### Step 2: Creating a New Branch (When on Main or Starting Fresh)
**When to use**: 
- Currently on `main` branch
- Task is large (multi-file changes, new features, major refactors)
- Starting a new autonomous task

**Procedure**:
```bash
git checkout -b feature/<task-name>
# Example: git checkout -b feature/autopilot-hardening-2026-0331
```

**Branch Naming Convention**:
- Format: `feature/<descriptive-task-name>`
- Date format: Include date for large tasks (YYYY-MMDD)
- Examples:
  - `feature/add-pagination-filters`
  - `feature/firestore-migration-2026-0331`
  - `feature/bug-fix-modal-closing`

### Step 2b: Register Branch in BRANCHES_STATUS.md (MANDATORY FOR NEW BRANCHES)

**CRITICAL:** After creating a new branch, immediately register it in the global branch registry for multi-agent coordination.

**HARD GATE:** No implementation edits are allowed until this registration is committed and pushed to `development`.

**Procedure**:
```bash
# 1. Check out the branch that hosts BRANCHES_STATUS.md (usually development or main)
git fetch origin
git checkout development  # or main, depending on your setup

# 2. Edit the global registry
# File: copilot/BRANCHES_STATUS.md

# 3. Add a new row with these columns:
#    Branch Name | Owner (pc<id>) | Type (feature|fix|chore) | Status (active) | 
#    Summary | Related Plan URL | Key Files | Date Created | Notes
#    - Summary is mandatory and must describe branch objective clearly

# 4. Commit ONLY the registry update
git add copilot/BRANCHES_STATUS.md
git commit -m "chore(branches): register feature/pc<id>/<descriptive-name>"

# 5. Push to development (or target branch)
git push origin development

# 6. Return to your feature branch
git checkout feature/<task-name>
```

**Why This Matters:**
- Prevents branch name collisions in multi-agent environments
- Enables coordination on overlapping work
- Maintains visibility of all active branches
- Supports intelligent task routing

**Example BRANCHES_STATUS.md Entry:**
```
| feature/pc001/firestore-migration | pc001 | feature | active | Migrating Firestore collections to camelCase | copilot/plans/active/firestore-migration/ | src/firebase/**, functions/** | 2026-04-06 | On track for Phase 2 |
```

**Note on Ownership:**
- Only modify rows containing your `owner_id/`
- Other agents' branches remain locked (informational only)
- Update "Last Updated" timestamp before pushing status changes

---

### Step 3: Updating Existing Branch (Small Tasks on Non-Main Branch)
**When to use**:
- Already on a feature branch
- Task is small or related to existing branch
- Continuing work on same branch
- Branch was already registered in BRANCHES_STATUS.md
- Branch owner matches `COPILOT_PC_ID`

**Procedure**:
```bash
git add <file1> <file2>
git commit -m "<properly-formatted-commit-message>"
git push origin <current-branch-name>
```

**Before Returning to Work:**
If you created a new branch in this session, ensure you completed Step 2b (register in BRANCHES_STATUS.md) first.

---

## 🔀 Merge Target Rule (MANDATORY)

- Always merge a branch into its `parent-branch` from `BRANCH_LOG.md`
- Never merge directly into `development` unless `parent-branch` is `development`
- If PR base branch does not match `parent-branch`, STOP and correct the PR target
- For child branches created for plan isolation, merge child -> parent branch only

---

## 📝 Commit Message Format (MANDATORY)

All commits must follow this format for clarity and consistency:

```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Test additions or updates
- `chore`: Build, dependency, or tooling changes

### Scope Examples
- `autopilot`: Autopilot system changes
- `admin-dashboard`: Admin dashboard feature
- `auth`: Authentication module
- `firestore`: Database/Firestore changes
- `ui`: UI components

### Subject Rules
- Imperative mood ("add" not "added" or "adds")
- No period at end
- Max 50 characters
- English language

### Examples
```
feat(autopilot): Add automatic git branch creation for large tasks
fix(admin-dashboard): Resolve modal closing on escape key
docs(git-workflow): Update branch naming conventions
refactor(auth): Extract permission validation to utility
test(admin-dashboard): Add test coverage for user filtering
```

---

## 🔁 Autopilot vscode/askQuestions Self-Response Loop

### Loop Pattern (MANDATORY UNTIL 100% TASK COMPLETION)

The autopilot must execute this loop after **EVERY major implementation block**:

1. **After completing a logical work unit** (feature, fix, test suite):
   ```
   Execute: vscode/askQuestions({
     questions: [{
       header: "task-progress",
       question: "What's next? Continue or check for remaining work?",
       options: [
         { label: "Continue working", recommended: true },
         { label: "Run final verification" }
       ]
     }]
   })
   ```

2. **On "Continue working"**: Immediately proceed to next task phase without stopping
3. **On "Run final verification"**: Execute final review (see Final Verification)
4. **Repeat until**: All planned work is 100% complete

### Loop Termination Conditions
The loop stops only when **ALL** of the following are true:
- ✅ All requested features are implemented
- ✅ All tests pass (`npm run test` clean)
- ✅ All code validations pass (`npm run lint` clean)
- ✅ All code changes are documented
- ✅ All files are committed and pushed
- ✅ Final verification review passes

---

## ✅ Final Verification Checklist (BEFORE CLOSING TASK)

Must be executed via `vscode/askQuestions` and user must confirm all items:

```
Final Pre-Closure Verification:

□ All requested features implemented and working
□ All existing functionality preserved (lossless)
□ All tests passing (npm run test ✅)
□ All linting passing (npm run lint ✅)
□ All documentation updated/created
□ All Git commits pushed to branch
□ Code review ready (clean history, clear messages)
□ No console.log debug statements left behind
□ All Spanish text verified for proper grammar
□ File path comments added to new files

Ready to close task? Confirm YES before proceeding.
```

---

## 🚨 Error Handling & Recovery

### If Push Fails
```bash
# Check status
git status

# If conflicts exist
git pull origin <branch-name>
# Resolve conflicts manually
git add .
git commit -m "fix: resolve merge conflicts"
git push origin <branch-name>
```

### If on Wrong Branch
```bash
# Check current branch
git branch --show-current

# If on main, create feature branch
git checkout -b feature/<task-name>

# Move commits if needed (advanced)
git cherry-pick <commit-hash>
```

---

## 📋 Quick Reference Commands

| Task | Command |
|------|---------|
| Check current branch | `git branch --show-current` |
| Create & switch to new branch | `git checkout -b feature/<name>` |
| View branch list | `git branch -a` |
| Stage changes (scoped) | `git add <file1> <file2>` |
| Commit with message | `git commit -m "<message>"` |
| Push to remote | `git push origin <branch-name>` |
| View recent commits | `git log --oneline -5` |
| View unstaged changes | `git diff` |
| View staged changes | `git diff --staged` |

---

## 🔒 Safety Guardrails

1. **Always verify branch before pushing**:
   ```bash
   git branch --show-current  # MUST not be "main"
   ```

2. **Never force-push to shared branches**:
   ```bash
   # BANNED: git push -f origin <branch>
   # OK: git push origin <branch>
   ```

3. **Commit frequently** (every logical work unit):
   - Easier to debug
   - Clear history for review
   - Simpler rollbacks

4. **Push before major refactors**:
   - Ensure current work is backed up
   - Create safety checkpoint

5. **Never use destructive revert shortcuts**:
   - Do not use `git checkout -- <file>`, `git checkout .`, or `git reset --hard`
   - If rollback is required, create a normal revert commit or ask for explicit user direction

---

## Integration with Autopilot Execution

This workflow applies to ALL autopilot tasks:
- Feature development
- Bug fixes
- Refactoring
- Documentation updates
- Configuration changes

When autopilot task begins:
1. ✅ Check branch (Step 1)
2. ✅ Create/select branch (Step 2 or 3)
3. ✅ Execute work with periodic commits
4. ✅ Use vscode/askQuestions loop every major block
5. ✅ Run final verification before closure

**Result**: Clean, traceable Git history with protective guardrails against accidental main branch pushes.
