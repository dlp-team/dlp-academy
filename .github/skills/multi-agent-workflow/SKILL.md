# .github/skills/multi-agent-workflow/SKILL.md
name: multi-agent-workflow
description: Handle zero-touch Git operations, safe branch namespacing, centralized status tracking, and autonomous PR/Merge flows for multi-agent environments. Includes per-branch claiming, conflict resolution escalation, and inter-Copilot handoff protocols.
---

# Multi-Agent Workflow Skill

## Objective
Abstract all Git complexity away from the user. Prevent merge conflicts on status tracking files, manage safe branching, autonomously resolve merge conflicts, and utilize Pull Requests to integrate code into the `development` branch without user intervention. Optimize for multi-Copilot coordination with zero race conditions.

---

## 0. PC ID Setup (MANDATORY FIRST STEP)

**Every Copilot must identify itself before any work begins.**

### PC ID Detection

Set environment variable `COPILOT_PC_ID`:

```bash
# In .env file (recommended):
COPILOT_PC_ID=pc1

# Bootstrap from template:
cp .env.example .env

# Or in shell:
export COPILOT_PC_ID=pc1

# Verify:
echo $COPILOT_PC_ID  # Should print: pc1
```

PowerShell alternative:

```powershell
# Session-only assignment:
$env:COPILOT_PC_ID = "pc1"

# Verify:
Write-Output $env:COPILOT_PC_ID
```

**Supported PC ID formats:**
- `pc1`, `pc2`, `pc3` (generic numbering)
- `miguel`, `gemini`, `chatgpt` (tool names)
- `you`, `fellow` (personal identifiers)
- Any lowercase alphanumeric + hyphen (max 20 chars)

**Your PC ID appears in:**
- Branch names: `feature/[PC_ID]/login`
- BRANCH_STATUS.md: `Claimed By: [PC_ID]`
- External comments: `from [PC_ID]`
- WORKING_SESSION.md: `Active PC: [PC_ID]`

**If not set:** Copilot will error and ask you to configure it.

---



---

## 1. Upstream Sync (MANDATORY PRE-FLIGHT)
Before starting ANY new work or reading instructions, you must ensure your baseline is current.

1. Run `git fetch origin`
2. Run `git checkout development` and `git pull origin development`
3. Read `.github/` folder for latest instructions and skills
4. If creating a new branch, branch off the newly synced `development`
5. If continuing on an existing feature branch:
   - Run `git pull origin development` to sync latest
   - If conflicts occur during upstream merge: **Autonomously resolve** (see Section 4b)
   - Do NOT stop; merge development into your feature branch to stay current

---

## 2. Strict Branch Namespacing (Git-Native Lock Mechanism)
Never use generic branch names. Branch names act as your primary ownership lock.

- **Format:** `<type>/<owner_id>/<brief-description>`
- **Types:**
  - `feature` — New capability or user-facing change
  - `fix` — Bug fix or regression correction
  - `chore` — Internal refactoring, dependency update, tooling
  - `experiment` — Exploratory work, not intended for production merge (use BRANCH_STATUS.md Status: testing)
- **Owner ID:** Use `pc1`, `pc2`, `pc3`, or your identifier (used to prevent conflicts)
- **Brief Description:** Lowercase, hyphenated, max 40 chars (e.g., `login-overlay-sso`, `auth-null-crash-fix`, `update-eslint`)

**Examples:**
- `feature/pc1/login-overlay-sso`
- `fix/pc2/auth-token-refresh-race-condition`
- `chore/pc1/upgrade-eslint-config`
- `experiment/pc2/new-canvas-renderer`

**Evaluation & Lock Protection:**
- Run `git branch -a` to see all work. Branch names immediately tell you owner ID and work type.
- **RULE: Do not commit to branches owned by other IDs** (different owner/ prefix) unless explicitly told to coordinate.
- If you need related work on another PC's branch, first read that branch's BRANCH_STATUS.md (see Section 3.2).

---

## 2.5 Sharing Modes (LOCKED vs. SHARED)

Branches can operate in two modes:

### Mode A: LOCKED (Default, Single PC)
```
Branch: feature/pc1/login
Ownership: Exclusive to pc1
Access: Only pc1 can push; others coordinate via external comments
When to use: Most features (single owner, clear responsibility)
```

**Example BRANCHES_STATUS.md entry:**
```markdown
| feature/pc1/login | pc1 | feature | active | locked | SSO login modal... |
```

### Mode B: SHARED (Multiple PCs, Coordinated Sequential Work)
```
Branch: feature/pc1-pc2/database-migration
Ownership: Joint (pc1 + pc2), but only ONE actively works at a time
Access: Both PCs can push, but coordinate via WORKING_SESSION.md
When to use: Pair work, 24/7 coverage (day/night shifts), emergencies
```

**Example BRANCHES_STATUS.md entry:**
```markdown
| feature/pc1-pc2/db-migration | pc1, pc2 | chore | active | shared | Database migration; PC1 day, PC2 night... |
```

### Shared Branch Coordination: WORKING_SESSION.md

For SHARED branches, create `WORKING_SESSION.md` at branch root:

```markdown
# Working Session: feature/pc1-pc2/database-migration

## Current Session
- **Active PC:** pc1
- **Session ID:** 2026-04-06-pc1-session-1
- **Started:** 2026-04-06 14:00 UTC
- **Estimated End:** 2026-04-06 18:00 UTC (handoff to pc2)

## Golden Rule
**Only ONE PC actively codes at a time. Prevents merge conflicts in shared branches.**

## Session Log
- 2026-04-06 14:00: PC1 starts; working on schemas
- (update continuously as work progresses)
- 2026-04-06 18:00: PC1 commits all work; pushes; updates this file
- 2026-04-06 18:05: PC2 pulls; reads session log; takes over
```

**Handoff Protocol for Shared Branches:**

1. **Active PC finishing:**
   - Commit all changes
   - Push to branch
   - Update WORKING_SESSION.md with what was accomplished
   - Push WORKING_SESSION.md
   - Notify next PC (append to External Comments in BRANCH_STATUS.md)

2. **Next PC taking over:**
   - Pull branch
   - Read WORKING_SESSION.md to understand previous PC's work
   - Update "Active PC" field: `Active PC: [Your PC ID]`
   - Continue work
   - (Repeat)

**Result:** No simultaneous edits, no merge conflicts in shared branches.

---



### 3.1 Global Branch Registry: `copilot/BRANCHES_STATUS.md`
**Location:** `copilot/BRANCHES_STATUS.md` (in `development` branch only)

**Purpose:** Single source of truth for all active work across the repo. Allows any Copilot to instantly understand what branches exist, who owns them, and their status.

**Structure (Markdown Table):**
```markdown
| Branch Name | Owner | Type | Status | Summary | Related Plan | Key Files | Last Updated | Notes |
|---|---|---|---|---|---|---|---|---|
| feature/pc1/login-overlay | pc1 | feature | active | Implementing SSO login modal with Firebase Auth | copilot/plans/active/login-overlay/ | src/components/modals/LoginOverlay.jsx, src/firebase/auth.js | 2026-04-06 10:30 | Using external OIDC provider |
| feature/pc2/database-migration | pc2 | feature | paused | Schema migration for auth tables | copilot/plans/active/db-migration/ | scripts/migrations/auth-tables.cjs | 2026-04-05 16:00 | Blocked: waiting on infrastructure approval |
| fix/pc1/auth-token-crash | pc1 | fix | ready-for-merge | Fix null ref in token refresh | copilot/plans/finished/auth-token-fix/ | src/hooks/useAuth.js | 2026-04-06 08:15 | All tests passing, awaiting merge |
```

**Valid Statuses:**
- `active` — Currently being worked on
- `paused` — Temporarily stopped (see Notes for reason)
- `blocked` — Cannot proceed without external input (see Notes)
- `ready-for-merge` — Work complete, PR created, awaiting merge confirmation
- `testing` — Experimental branch, do not merge to production
- `untouchable` — Reserved branch (e.g., legacy, hotfix-only), do not modify without special permission

**Key Rules for BRANCHES_STATUS.md:**
1. **APPEND-ONLY for new branches:** When you create a branch, add a new row
2. **Only modify your own rows:** If `Branch Name` contains `pc2/`, only PC2 can edit that row
3. **NEVER delete rows:** Update Status column instead; merge only happens AFTER work is complete
4. **Timestamp updates on every non-trivial change:** Update "Last Updated" before pushing
5. **Link to plan and related files:** Make navigation instant for other Copilots

**When to Update:**
- When creating a new branch: Add row immediately
- When changing status (e.g., active → paused): Update row and push
- When completing work: Set to ready-for-merge before PR
- On merge: Update status to mark completion (do NOT delete row)

### 3.2 Per-Branch Status & Claiming: `BRANCH_STATUS.md`
**Location:** `BRANCH_STATUS.md` at root of each feature branch

**Purpose:** Per-branch memory. Tracks who is currently working, what they're doing, related files, external notes, and blockers. This is the **claiming mechanism** that prevents race conditions.

**Structure (Markdown):**

```markdown
# Branch Status: feature/pc1/login-overlay

## Current Work Claim
- **Claimed By:** pc1
- **Claimed At:** 2026-04-01 14:00 UTC
- **Status:** active (or paused, blocked, testing, ready-for-merge, untouchable)
- **Reason (if paused/blocked):** Waiting on Firebase org approval for OAuth scopes; expected 2026-04-08

## Work Summary
Implementing OIDC-based SSO login modal integrated with Firebase Auth. Supports multiple identity providers (Google, Microsoft, Generic OIDC). Coordinates with token refresh logic.

## Key Files Being Modified
- [src/components/modals/LoginOverlay.jsx](../src/components/modals/LoginOverlay.jsx)
- [src/firebase/auth.js](../src/firebase/auth.js)
- [src/hooks/useAuth.js](../src/hooks/useAuth.js)

## Related Planning & Documentation
- Plan: [copilot/plans/active/login-overlay/](../copilot/plans/active/login-overlay/)
- Lossless Reports: [copilot/explanations/temporal/lossless-reports/2026-04-02/](../copilot/explanations/temporal/lossless-reports/2026-04-02/)
- Explanation: [copilot/explanations/temporal/login-overlay-notes.md](../copilot/explanations/temporal/login-overlay-notes.md)

## External Comments (For Other Copilots/Users)
> **2026-04-04 10:15 (from pc2):** Hey, I noticed this branch touches auth. Our database migration also modifies auth tables. Let me know if you hit issues.
> **Response 2026-04-04 15:30 (by pc1):** We're on Firebase path, no direct DB touches. All good for now. Will coordinate before merge.

> **2026-04-05 08:00 (from user):** Need this merged ASAP for demo on Friday.

## Blockers / Watch-Outs
- Waiting for OAuth ID token configuration from infrastructure
- Ensure compatibility with upcoming token refresh refactor (see feature/pc3/token-refresh-v2)
- Do not merge until external OAuth scopes are approved

## Merge Readiness Checklist
- [ ] All tests passing (`npm run test`)
- [ ] Linting clean (`npm run lint`)
- [ ] No external blockers (see above)
- [ ] Conflicts resolved with development branch
- [ ] PR review complete
- [ ] User approval for merge
```

**Key Rules for BRANCH_STATUS.md:**
1. **Create immediately after branching:** This is your PC ID's lock on the branch
2. **Only the claiming PC can modify Status:** If "Claimed By" is pc2, only pc2 changes Status
3. **Append-only External Comments:** Other PCs/users append notes; they don't erase yours
4. **Update weekly if branch is long-lived:** Keep "Last Updated" fresh
5. **Preserve history:** Do not rewrite past comments; only append new ones

**When Claiming a Branch:**
1. Create `BRANCH_STATUS.md` on the branch immediately after git checkout
2. Fill "Claimed By" with your PC ID, "Claimed At" with ISO timestamp
3. Set Status to `active`
4. Write a brief summary so other Copilots understand what you're doing
5. Commit and push immediately: `git add BRANCH_STATUS.md && git commit -m "docs: claim branch for pc1" && git push`
6. Now you can safely code knowing no other PC will touch this branch

**When Taking Over a Branch:**
1. Read BRANCH_STATUS.md to see who was working and what status they left
2. If status is `paused` or `blocked`, read Reason to understand blockers
3. If status is `active` but claimed by different PC ID: **Do not modify this branch.** Wait until status changes or ask user.
4. If status is empty or `None`: You can claim it by updating BRANCH_STATUS.md:
   ```markdown
   - **Claimed By:** [Your PC ID]
   - **Claimed At:** [New timestamp]
   - **Status:** active
   - Previous work: [Brief description of what prior PC left off]
   ```
5. Append to External Comments: "Taken over from pc1 for continuation on [reason]"
6. Commit, push, and proceed

### 3.3 Per-Branch Work Log: `BRANCH_LOG.md` (For Long-Lived Branches Only)
**Location:** `BRANCH_LOG.md` at root of feature branch (or `copilot/branch-logs/<branch-name>/BRANCH_LOG.md`)

**Purpose:** Track all work completed on a branch so future Copilots (or you, months later) understand what happened and where to find the work artifacts.

**When to Create:**
- Long-lived branches (expected > 5 days of active work)
- `development` branch always has a BRANCH_LOG.md
- Short-lived branches (< 3 days) don't need one; BRANCH_STATUS.md is sufficient

**Structure (Markdown):**

```markdown
# Branch Log: feature/pc1/login-overlay

## Work Timeline
- **2026-04-01 14:00**: Started work; created BRANCH_STATUS.md
- **2026-04-02 09:30**: Completed Phase 1 (Firebase Auth integration)
- **2026-04-05 16:45**: Completed Phase 2 (UI component design); moved plan to finished/

## Plans Linked
- [copilot/plans/finished/login-overlay/](../../plans/finished/login-overlay/) - SSO overlay feature
  - Completed: 2026-04-05
  - Status: Ready for merge
  - Duration: 5 days

## Lossless Reports (Per Phase)
- [2026-04-02 Phase 1 Report](../../explanations/temporal/lossless-reports/2026-04-02/login-overlay-phase1.md) — Firebase setup, no regressions
- [2026-04-05 Phase 2 Report](../../explanations/temporal/lossless-reports/2026-04-05/login-overlay-phase2.md) — UI complete, all tests passing

## Key Files Modified
- src/components/modals/LoginOverlay.jsx (new)
- src/firebase/auth.js (modified)
- src/hooks/useAuth.js (modified)
- tests/unit/LoginOverlay.test.js (new)

## External Dependencies / Coordinates
- Blocked on OAuth provider approval (waiting until 2026-04-08)
- Related to feature/pc2/database-migration (minimal overlap, no conflicts)

## CI/Test Results
- Phase 1: All tests passed (100% - no new failures)
- Phase 2: All tests passed (100% - no new failures)
- Linting: Clean across both phases

## Merge Status
- Created PR: copilot/explanations/temporal/login-overlay-pr-notes.md
- Awaiting user merge confirmation
```

**Key Rules for BRANCH_LOG.md:**
1. **Append-only:** Add entries as work completes, never rewrite past entries
2. **Link to external artifacts:** Reference plans, lossless reports, and explanations
3. **Timestamp every entry:** Make it clear when work happened
4. **Preserve for historical understanding:** After merge, keep this file on the merged branch so future devs know what was done

---

## 4. Dependency Detection Between Branches
When claiming a branch for new work, check if it depends on or relates to existing branches.

**Dependency Detection Algorithm:**

1. **Read BRANCHES_STATUS.md** — Scan all active branches
2. **Extract key files** — From "Key Files" column, note which files are being modified
3. **Compare with your task** — Do your assigned files overlap with active branches?
4. **Decision tree:**
   - **Overlap < 20%:** Branch off `development` (independent, low conflict risk)
   - **Overlap 20-60%:** May branch off related branch OR development (coordinate with that PC first)
   - **Overlap > 60%:** Consider same branch or sub-branch (high conflict risk otherwise)

**Example:**
- PC1 is working on `feature/pc1/database-migration` (modifying: scripts/migrations/auth-tables.cjs, src/firebase/db.js)
- New task: "Add auth tables schema"
- Your files: src/firebase/schema.js, scripts/migrations/auth-schema.cjs
- Overlap: 60% (scripts/migrations/ and src/firebase/)
- Decision: Coordinate with PC1. Either:
  - Wait for PC1 to finish (if 1-2 days)
  - Create `feature/pc2/auth-schema` off development, then merge after PC1 finishes (manage conflicts manually)
  - Branch off `feature/pc1/database-migration` directly with PC1 approval (tightest coordination)

---

## 5. Autonomous Conflict Resolution (ZERO-TOUCH, TIERED APPROACH)

### 5.1 Attempt 1: Automated Analysis (ALWAYS TRY FIRST)

When a merge conflict occurs (during upstream sync or pre-merge dry-run):

1. **Identify conflicted files:**
   ```bash
   git diff --name-only --diff-filter=U
   ```

2. **Read each conflicted file** and locate conflict markers:
   ```
   <<<<<<< HEAD
   [Your version]
   =======
   [Incoming version]
   >>>>>>> [branch]
   ```

3. **Analyze semantic intent:**
   - **Code files:** Can you merge both changes logically? (e.g., both add different functions to the same file)
   - **Config/JSON:** Prefer development version as authoritative; merge custom fields
   - **Firestore rules:** CRITICAL — wrong merge = security hole. Merge only if you fully understand both versions
   - **Markdown:** Preserve both descriptions; append rather than delete

4. **Rewrite to resolve:**
   - If both changes are independent: Merge both (preserve both versions)
   - If one is a subset of the other: Use the fuller version
   - If conflicting logic: Use development as base, apply your logic on top

5. **Validate resolution:**
   ```bash
   npm run test
   npm run lint
   npm run build  # if applicable
   ```

6. **If all pass:**
   ```bash
   git add <conflicted-files>
   git commit -m "chore(git): resolve merge conflicts from development (automated analysis)"
   ```
   **Proceed to Section 6 (PR & Merge).**

7. **If validation fails → Proceed to Attempt 2.**

### 5.2 Attempt 2: Escalation & Logging (If Automated Fails)

If Attempt 1 validates fail or conflicts are complex:

1. **Abort the merge:**
   ```bash
   git merge --abort
   ```

2. **Create a conflict report:**
   ```
   copilot/merge-conflicts/YYYY-MM-DD-HH-MM-<branch-name>-conflict-report.md
   ```

3. **Document the conflict:**
   ```markdown
   # Merge Conflict Report: feature/pc1/login-overlay
   **Date:** 2026-04-06 11:30 UTC
   **Conflict Type:** Attempted merge from development into feature/pc1/login-overlay
   **Status:** Escalated (manual resolution needed)

   ## Conflicted Files
   - src/firebase/auth.js (3-way conflict in token refresh logic)
   - firestore.rules (permission scope conflict)

   ## Conflict Details

   ### src/firebase/auth.js
   - **Your side (feature/pc1):** Added OIDC token refresh with 60-second timer
   - **Development side:** Refactored token refresh to use centralized timer manager
   - **Issue:** Both modify the same refreshToken() function; incompatible signatures

   ### firestore.rules
   - **Your side:** Added `allow read: if user.auth.issuer == 'oidc'`
   - **Development side:** Changed to `allow read: if user.verified == true`
   - **Issue:** Different permission models; need to align

   ## Recommended Resolution
   1. Contact PC2 (working on development) to align on token refresh approach
   2. Decide: Use new centralized timer OR keep OIDC-specific logic
   3. Update firestore.rules to support both verified and OIDC issuers
   4. Re-attempt merge after sync

   ## Next Steps
   - [ ] Notify user of conflict
   - [ ] Wait for user direction OR coordinate with other PC
   - [ ] Reattempt merge after resolution
   ```

4. **Update BRANCH_STATUS.md** with blocker:
   ```markdown
   ## Blockers
   - Merge conflict from development: see [copilot/merge-conflicts/2026-04-06-11-30-login-overlay-conflict-report.md](../copilot/merge-conflicts/2026-04-06-11-30-login-overlay-conflict-report.md)
   - Awaiting user guidance on resolution approach
   ```

5. **Notify user** (via vscode/askQuestions):
   - Describe conflicts
   - Link to conflict report
   - Ask: "How would you like me to proceed? (a) Keep OIDC approach, (b) Use centralized timer, (c) Coordinate with pc2?"

6. **Based on user decision:**
   - If clear: Reattempt merge with new approach
   - If "coordinate with pc2": Append to External Comments in BRANCH_STATUS.md and wait
   - If complex: Pause branch and wait for deeper review

---

## 6. Pre-Merge Dry-Run (SAFETY CHECK BEFORE PR)

Before creating a Pull Request, simulate the merge to detect conflicts early:

1. **Fetch latest development:**
   ```bash
   git fetch origin development
   ```

2. **Dry-run merge (no commit, no-ff):**
   ```bash
   git merge --no-commit --no-ff origin/development
   ```

3. **If no conflicts:**
   - All tests and lint pass
   - Abort dry-run: `git merge --abort`
   - Proceed to Section 7 (Pull Request)

4. **If conflicts detected:**
   - Run Attempt 1 & 2 from Section 5 (Autonomous Conflict Resolution)
   - Only after conflicts are resolved and validated, abort dry-run and proceed

---

## 7. Pull Request & Safe Merge Engine

### 7.1 Create Pull Request

Once your branch is ready (all commits pushed, dry-run clean):

1. **Final pre-check:**
   - All commits follow semantic format: `<type>(<scope>): <subject>`
   - Commit bodies answer: What is different? Why changed? Any watch-outs?
   - Reference: `copilot/autopilot/git-workflow-rules.md`

2. **Verify security compliance** (MANDATORY):
   ```bash
   npm run security:scan:branch  # Must pass; no credentials exposed
   git check-ignore -v .env      # Must show .env is ignored
   ```

3. **Push to origin:**
   ```bash
   git push origin <current-branch>
   ```

4. **Create PR with GitHub CLI:**
   ```bash
   gh pr create \
     --base development \
     --head <current-branch> \
     --title "Merge: <brief-description>" \
     --body "# Feature Completion

   ## Plans Completed
   - [copilot/plans/finished/login-overlay/](../../plans/finished/login-overlay/)

   ## Lossless Reports
   - [2026-04-05 Phase 2 Report](../../explanations/temporal/lossless-reports/2026-04-05/login-overlay-phase2.md)

   ## Files Changed
   - src/components/modals/LoginOverlay.jsx (new)
   - src/firebase/auth.js (modified)
   - src/hooks/useAuth.js (modified)

   ## Watch-Outs
   - Ensure OAuth provider approval is final before merge
   - Token refresh logic coordinates with feature/pc2/database-migration

   ## Testing
   - Unit tests: 100% pass rate
   - Linting: Clean
   - Manual testing: Verified OAuth flow with test providers
   "
   ```

### 7.2 Merge Decision Logic (CRITICAL: User Confirmation Required)

Before merging, **always ask for user confirmation:**

```bash
vscode/askQuestions({
  questions: [
    {
      header: "merge-confirmation",
      question: "Branch feature/pc1/login-overlay is ready. Approve merge to development?",
      options: [
        { label: "Merge now", recommended: true },
        { label: "Hold for manual review" },
        { label: "Merge later", description: "Postpone merge until specified" },
        { label: "Never merge (mark untouchable)" }
      ]
    }
  ]
})
```

**Decision Tree Based on User Response:**

- **"Merge now":**
  - PR checks must pass (CI/tests/lint)
  - Execute merge: `gh pr merge --squash --delete-branch`
  - Update BRANCHES_STATUS.md: Change status to "merged" or remove row (post-merge cleanup)
  - Add entry to BRANCH_LOG.md (if exists): "Merged into development on 2026-04-06 12:00"

- **"Hold for manual review":**
  - Update BRANCH_STATUS.md: Status = `ready-for-merge`
  - Wait. Do not auto-merge. User will manually merge when ready.

- **"Merge later":**
  - Update BRANCH_STATUS.md: Status = `paused`
  - Reason: "Scheduled for merge 2026-04-10"
  - Wait until scheduled date, then re-ask merge confirmation

- **"Never merge (untouchable)":**
  - Update BRANCH_STATUS.md: Status = `untouchable`
  - Update BRANCHES_STATUS.md: Mark as `untouchable`
  - This branch is now archived; do not touch without explicit override

### 7.3 Post-Merge Cleanup

Once merged:

1. **Delete local branch:**
   ```bash
   git branch -d <merged-branch>
   ```

2. **Verify remote deletion:**
   ```bash
   git branch -a  # Should not show <merged-branch> anymore
   ```

3. **Update BRANCHES_STATUS.md on development:**
   - Option A: Remove the row (if you prefer clean table)
   - Option B: Update Status to "merged" and add date (for historical reference)

4. **Verify development is healthy:**
   ```bash
   git checkout development
   git pull origin development
   npm run test && npm run lint && npm run build
   ```

---

## 8. External Comments & Inter-Copilot Communication

### 8.1 Two Places for External Input

**Location 1: BRANCH_STATUS.md (Per-Branch, Real-Time)**
- Used for immediate, branch-specific coordination
- Example: "Hey, your auth changes conflict with my database migration. Let's sync tomorrow."
- Append-only, timestamped, with author PC ID

**Location 2: copilot/plans/active/<plan>/external-notes.md (Plan-Level, Broader Context)**
- Used for plan-level feedback and dependencies
- Example: "The OAuth provider deprecated v1 endpoints in Q3. Need to migrate by June."
- Managed per-plan, not per-branch

### 8.2 Reading External Comments

**When picking up a branch:**
1. Read BRANCH_STATUS.md external comments section first
2. Understand any coordination needs or blockers
3. Respond in the same section if needed (append, don't erase)

**When starting related work:**
1. Check BRANCH_STATUS.md external comments of related branches
2. Check copilot/plans/active/<plan>/external-notes.md for broader context
3. Coordinate if overlap > 20%

### 8.3 Writing External Comments (For Other PCs/Users)

**You can ALWAYS append to External Comments**, even if you don't own the branch:

```markdown
## External Comments

> **2026-04-06 11:45 (from pc2):** I noticed you're modifying src/firebase/auth.js. I'm also touching that for the database migration. Can we sync on the token refresh approach?
```

**The claiming PC will read this and decide how to respond.**

---

## 9. Handoff Protocol (Taking Over a Branch From Another PC)

When you're assigned to continue work on a branch started by another PC:

### 9.1 Read & Understand Phase

1. **Read BRANCH_STATUS.md:**
   - Who was on it before? (Claimed By)
   - What status did they leave? (active, paused, blocked, etc.)
   - What's the work summary?
   - Are there external comments or blockers?

2. **Read BRANCH_LOG.md** (if it exists):
   - What plans were completed?
   - Which lossless reports document the work?
   - What files were modified?

3. **Read linked plans:**
   - copilot/plans/active/<plan-name>/README.md
   - copilot/plans/active/<plan-name>/strategy-roadmap.md

4. **Verify branch health:**
   ```bash
   git checkout <branch>
   git pull origin <branch>
   npm run test && npm run lint
   ```

### 9.2 Claim Phase

1. **Update BRANCH_STATUS.md:**
   ```markdown
   ## Current Work Claim
   - **Claimed By:** pc2  (changed from pc1)
   - **Claimed At:** 2026-04-06 14:00 UTC  (new timestamp)
   - **Status:** active  (may change if paused)
   ```

2. **Append to External Comments:**
   ```markdown
   > **2026-04-06 14:00 (from pc2):** Taken over from pc1 for continuation. Status was [paused/active]. Will proceed with Phase 2 implementation.
   ```

3. **Commit and push:**
   ```bash
   git add BRANCH_STATUS.md
   git commit -m "docs: claim branch pc1->pc2 for continuation"
   git push origin <branch>
   ```

### 9.3 Continue Phase

- Read all context (plans, lossless reports, explanations)
- Understand what was completed and what's blocked
- Resume work from where previous PC left off
- Update BRANCH_STATUS.md as needed (e.g., if paused, change to active)

---

## 10. Branch Cleanup & Archive

### 10.1 When to Delete

- **Auto-delete on merge:** Use `gh pr merge --delete-branch` (deletes remote branch automatically)
- **Long-lived but inactive:** After 30 days with no activity, propose archival (mark Status as "archived" before deletion)

### 10.2 Optional: Keep Branch for History

If you want to preserve a merged branch for reference:
1. Do NOT use `gh pr merge --delete-branch`
2. Instead: `git push origin <branch>` (keep remote)
3. Update BRANCHES_STATUS.md: Status = "archived" (won't be worked on again)
4. Visually distinguish archived branches by prefixing with `archived-` or using a git tag

---

## 11. Rebase vs. Merge for Upstream Sync

**Current approach:** Merge development into feature branch (creates merge commit)
**Alternative approach:** Rebase feature branch onto development (linear history)

### When to Use Merge:
- Multiple Copilots are using the same branch (rebase can rewrite history)
- You want a clear merge commit for auditing
- **Recommended: Use merge for multi-user branches**

### When to Use Rebase:
- You're solo on a branch
- You want linear, clean history
- No one else is working on the same branch

**Recommendation:** Default to **merge** to prevent "rebase conflicts" in multi-agent environments.

---

## 12. Quick Reference: Status Transitions

```
          [Start]
            |
            v
     [Create Branch]
            |
            v
    Read BRANCHES_STATUS.md
            |
            v
   Dependency Detection
            |
            v
   Claim Branch (BRANCH_STATUS.md)
            |
            v
        [active]
      /    |    \
     /     |     \
  Work  Paused  Blocked
    |      |       |
    v      v       v
 Sync from continue  -->  Resolve
development         Blockers
    |                  |
    v                  v
Dry-run Merge -----> Ready
    |                  |
    v                  v
Create PR <---------- For Merge
    |                  |
    v                  v
User Confirm -------> Merge
    |                  |
    v                  v
 [Merged] --------> Cleanup
            |
            v
        [End]
```

---

## 13. Troubleshooting

| Problem | Root Cause | Solution |
|---------|-----------|----------|
| Can't claim branch (already claimed) | Another PC has Status = active | Append external comment asking for eta. If abandoned, ask user for override. |
| Merge conflicts won't resolve | Complex semantic conflict | Create conflict report (Section 5.2), ask user |
| Branch diverged from development | Upstream sync not done | `git fetch && git pull origin development && git merge` |
| Accidental commit to wrong branch | Branch name typo or checkout error | Use `git branch` to verify. If committed wrong file, reset and recommit to correct branch. |
| PR CI checks failing | Code or tests broken | Fix locally, push new commit; PR auto-updates |
| Merge stuck (user indefinitely pauses) | Feature stalled, branch lingering | After 30 days: propose archive or delete; document reason |

---

## Summary

**The multi-agent workflow is designed around three core files:**
1. **`copilot/BRANCHES_STATUS.md`** — Global registry of all branches (who owns, status, plan link)
2. **`BRANCH_STATUS.md`** (per-branch) — Claiming mechanism + work summary + external notes
3. **`BRANCH_LOG.md`** (per-branch, long-lived) — Work history + completed plans + artifacts

**Core rules:**
- ✅ Branch names are your lock (`type/owner_id/desc`)
- ✅ Always read status files before coding
- ✅ Claim a branch immediately by creating/updating BRANCH_STATUS.md
- ✅ Autonomously resolve conflicts; escalate only if Attempt 1 fails
- ✅ Create PRs and ask user for merge confirmation
- ✅ Use external comments to coordinate between Copilots
- ✅ Never stop asking the user for permission on significant decisions

**This keeps your collaborator completely out of Git complexity while preventing race conditions and merge conflicts.**