# Autopilot Git Workflow Rules (Required for All Autopilot Tasks)

## 🚫 CRITICAL GIT RESTRICTIONS

### Main Branch Protection (ABSOLUTE)
- **NEVER push to `main` branch** - This is categorically forbidden
- **NEVER commit directly to `main` - Always use a feature branch**
- If autopilot detects it is on `main`, STOP and create a new branch immediately

---

## 🔄 Git Workflow for Autopilot (MANDATORY)

### Step 1: Branch Status Check (BEFORE ANY COMMIT)
```bash
git branch --show-current
```
**Purpose**: Determine current branch name and decide workflow:
- If on `main` → **CREATE NEW BRANCH** (see Step 2)
- If on feature branch → **UPDATE EXISTING BRANCH** (see Step 3)

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

### Step 3: Updating Existing Branch (Small Tasks on Non-Main Branch)
**When to use**:
- Already on a feature branch
- Task is small or related to existing branch
- Continuing work on same branch

**Procedure**:
```bash
git add .
git commit -m "<properly-formatted-commit-message>"
git push origin <current-branch-name>
```

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
| Stage changes | `git add .` |
| Commit with message | `git commit -m "<message>"` |
| Push to remote | `git push origin <branch-name>` |
| View recent commits | `git log --oneline -5` |
| Reset uncommitted changes | `git checkout .` |
| Abort current operation | `git reset --hard HEAD` (use with caution) |

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
