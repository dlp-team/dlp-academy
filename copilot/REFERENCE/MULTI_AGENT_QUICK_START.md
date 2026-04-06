# Multi-Agent Workflow: Quick Start Guide

**Read this first!** If you're about to start work in this repo with multiple Copilots, follow this 5-step checklist.

---

## What You Need to Know

**Goal:** Multiple Copilots (pc1, pc2, pc3, ...) work on different features **simultaneously** without stepping on each other's toes or causing merge conflicts.

**Three files make this work:**

1. **`copilot/BRANCHES_STATUS.md`** — Global map of all active branches (who's working on what)
2. **`BRANCH_STATUS.md`** (on each branch) — Claiming mechanism + work summary + coordination hub
3. **`BRANCH_LOG.md`** (on long-lived branches) — History of what was completed + artifacts

---

## Quick Start: I'm PC1 and Starting New Work

### Step 1: Understand the Task
Read the user's request carefully. Identify:
- What's being built?
- Which files will change?
- Any dependencies on other work?

### Step 2: Fetch Latest & Check Global Status
```bash
git fetch origin
git checkout development
git pull origin development
```

Open `copilot/BRANCHES_STATUS.md` and scan existing branches:
- Any branches with overlapping file changes?
- If yes, coordinate with that PC (see "Dependency Detection" in SKILL.md)

### Step 3: Create Branch & Claim It
```bash
# Branch off development using the naming convention
git checkout -b feature/pc1/your-feature-name

# Copy the template and create your status file
# (See: copilot/templates/BRANCH_STATUS.template.md)
# Create BRANCH_STATUS.md at root with:
# - Claimed By: pc1
# - Claimed At: [timestamp]
# - Status: active
# - Work Summary: [2-3 sentences]
# - Key Files: [which files you'll modify]
# - Related Plan: [link to your plan]

git add BRANCH_STATUS.md
git commit -m "docs: claim branch for pc1"
git push origin feature/pc1/your-feature-name

# Now update the global status file
git checkout development
git pull origin development

# Edit copilot/BRANCHES_STATUS.md:
# Add row: | feature/pc1/your-feature-name | pc1 | feature | active | ... |

git add copilot/BRANCHES_STATUS.md
git commit -m "chore(branches): add feature/pc1/your-feature-name"
git push origin development
```

### Step 4: Return to Your Branch & Code
```bash
git checkout feature/pc1/your-feature-name
# Now start implementing your feature
```

### Step 5: When Work is Complete
```bash
# Sync with latest development
git fetch origin
git pull origin development
# (Resolve conflicts autonomously if they occur; see SKILL.md Section 5)

# Create PR and ask user for merge confirmation
gh pr create --base development --head feature/pc1/your-feature-name \
  --title "Merge: Your feature title" \
  --body "## Work Complete\n...[see SKILL.md for full body template]"

# Wait for user to approve merge via vscode/askQuestions
```

---

## Quick Start: I'm PC2 and Picking Up an Existing Branch

### Step 1: Check Global Status
```bash
git fetch origin
git checkout development
git pull origin development
```

Open `copilot/BRANCHES_STATUS.md` and find the branch you're taking over.

### Step 2: Checkout Branch & Read Its Status
```bash
git checkout feature/pc1/that-feature
git pull origin feature/pc1/that-feature
```

Open `BRANCH_STATUS.md` at the root and read:
- Who was working on it? (Claimed By)
- What status did they leave? (active, paused, blocked?)
- What blockers exist? (see "Blockers / Watch-Outs" section)
- Any external comments I should know about?

### Step 3: Claim the Branch
Update `BRANCH_STATUS.md`:
```markdown
## Current Work Claim
- **Claimed By:** pc2  ← changed from pc1
- **Claimed At:** [new timestamp]
- **Status:** active  ← may change if paused
```

Append to External Comments:
```markdown
> **[timestamp] (from pc2):** Taken over from pc1 for continuation. Previous status: [paused/active]. Will proceed with Phase 2.
```

Commit and push:
```bash
git add BRANCH_STATUS.md
git commit -m "docs: claim branch for continuation (pc1->pc2)"
git push origin feature/pc1/that-feature
```

### Step 4: Understand Previous Work
Read linked artifacts:
- `copilot/plans/active/[plan-name]/` — Understand scope and phases
- Lossless reports — See what was completed and validated
- `BRANCH_LOG.md` (if it exists) — Timeline of what happened

### Step 5: Resume Work
- Verify test health: `npm run test && npm run lint`
- Check for unresolved blockers in BRANCH_STATUS.md
- Continue implementation

---

## Quick Start: Resolving Merge Conflicts

### If Conflicts Occur During `git pull origin development`

**IMPORTANT:** Do NOT ask the user for help. Handle this autonomously!

```bash
# Conflicts will appear. Don't panic.
git diff --name-only --diff-filter=U  # See conflicted files

# For each file:
# 1. Open it and find <<<<<<< HEAD ... =======  ... >>>>>>>
# 2. Analyze both versions and merge logically
# 3. Delete conflict markers
# 4. Save the file

# Validate:
npm run test && npm run lint

# If all pass:
git add <conflicted-files>
git commit -m "chore(git): resolve merge conflicts from development (automated)"

# If validation fails:
# See SKILL.md Section 5.2 (Escalation & Logging)
# Create conflict report in copilot/merge-conflicts/
```

---

## Quick Start: Creating a PR & Merging

### When Work is Complete

```bash
# Update BRANCH_STATUS.md
# Status: ready-for-merge
# Mark merge readiness checklist: [ ] ALL items checked

git add BRANCH_STATUS.md
git commit -m "docs: mark ready for merge"
git push origin feature/pc1/your-feature

# Create PR
gh pr create --base development --head feature/pc1/your-feature \
  --title "Merge: Feature title" \
  --body "## Plans Completed\n...[include lossless report link, watch-outs, etc.]"

# Ask user for merge confirmation
vscode/askQuestions({
  questions: [{
    header: "merge-confirmation",
    question: "Branch feature/pc1/your-feature is ready. Approve merge to development?",
    options: [
      { label: "Merge now", recommended: true },
      { label: "Hold for review" },
      { label: "Never merge" }
    ]
  }]
})

# If user approves:
gh pr merge --squash --delete-branch

# Update BRANCHES_STATUS.md
# Status: archived (or remove row if preferred)
```

---

## Three Golden Rules

1. **Always read BRANCH_STATUS.md before touching a branch** — It tells you if another PC owns it
2. **Update BRANCH_STATUS.md as your first commit after claiming** — This is your lock
3. **Resolve conflicts autonomously** — Never ask the user "how do I fix this merge conflict?"

---

## File Reference Guide

| File | Location | Purpose | When to Update |
|------|----------|---------|---|
| BRANCHES_STATUS.md | `copilot/` | Global map of all branches | When creating/merging branches |
| BRANCH_STATUS.md | Root of each branch | Per-branch claiming + coordination | Weekly, and when status changes |
| BRANCH_LOG.md | Root of long-lived branches | Work history + artifacts | After each phase completion |

---

## Common Scenarios

### Scenario 1: Two Branches Modify Same File
**Problem:** I'm working on `feature/pc1/login`, pc2 is working on `feature/pc2/auth-refactor`. Both modify `src/firebase/auth.js`.

**Solution:**
1. Read `copilot/BRANCHES_STATUS.md` — See pc2's branch is "active"
2. Check "Key Files": yes, `src/firebase/auth.js` is listed
3. Append to that branch's BRANCH_STATUS.md External Comments: "Hey pc2, I'm also modifying auth.js. Let's coordinate before merge."
4. Plan to merge one branch first, then the other pulls/syncs

### Scenario 2: My Branch is Blocked
**Problem:** I'm waiting for infrastructure approval before I can continue.

**Solution:**
1. Update `BRANCH_STATUS.md`:
   - Status: `blocked`
   - Reason: "Waiting on Firebase OAuth scope approval; expected 2026-04-08"
2. Push the update: `git add BRANCH_STATUS.md && git commit -m "docs: mark branch blocked" && git push`
3. Update `copilot/BRANCHES_STATUS.md` Status column to `blocked`
4. When unblocked, change Status to `active` and resume

### Scenario 3: My Branch is Paused (Handed Off)
**Problem:** PC1 needs to pause work temporarily; PC2 will continue.

**Solution (PC1):**
1. Update `BRANCH_STATUS.md`:
   - Status: `paused`
   - Reason: "Paused for 3 days; PC2 will continue. Phase 2 UI components are next."
2. Add to External Comments: "Handing off to pc2 for continuation. Tests passing, no blockers."
3. Push and notify pc2

**Solution (PC2):**
1. Checkout the branch
2. Read BRANCH_STATUS.md
3. Update Claimed By to pc2, Status to `active`
4. Resume work

### Scenario 4: Merge Conflicts Are Complex
**Problem:** Tried to merge development into my branch; conflicts in `src/firebase/auth.js` are too complex to resolve automatically.

**Solution:**
1. Create a conflict report: `copilot/merge-conflicts/2026-04-06-11-30-auth-conflict.md`
2. Document the conflict details (what changed on both sides, why they're incompatible)
3. Update `BRANCH_STATUS.md`: Status = `blocked`, Reason = "See merge conflict report"
4. Ask user via vscode/askQuestions: "Merge conflict detected. How should I proceed? (a) Keep my version, (b) Use development version, (c) Manually resolve?"

---

## Emergency: I Accidentally Committed to the Wrong Branch!

```bash
# Check which branch you're on
git branch

# If you committed to the wrong branch:
# 1. Note the commit hash: git log --oneline (see the latest commit)
# 2. Undo it: git reset --soft HEAD~1 (undoes commit but keeps files staged)
# 3. Switch to correct branch: git checkout feature/pc1/correct-branch
# 4. Commit again: git commit -m "your message"
# 5. Push both branches to clean up
```

---

## Need Help?

- **Read the full SKILL.md:** `.github/skills/multi-agent-workflow/SKILL.md` for detailed workflows
- **Check templates:** `copilot/templates/BRANCH_STATUS.template.md` and `copilot/templates/BRANCH_LOG.template.md`
- **Review this guide again:** Especially the "Three Golden Rules" and "Common Scenarios"

---

**Ready? Create your first branch and start coding!**

