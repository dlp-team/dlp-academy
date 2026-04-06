# Multi-Agent Workflow: PC ID Detection & Shared Branch Strategies

**Date:** 2026-04-06  
**Purpose:** Clarify how Copilot identifies itself and handle both locked (exclusive) and shared (collaborative) branches.

---

## Part 1: PC ID Detection

### How Does Copilot Know Which PC It Is?

**Option 1: Environment Variable (RECOMMENDED)**
```bash
# Set in .env, .bashrc, or system environment
export COPILOT_PC_ID=pc1
# OR: export COPILOT_PC_ID=miguel_dlp

# Copilot runs at start:
$PC_ID = process.env.COPILOT_PC_ID
if (!$PC_ID) {
  throw new Error("COPILOT_PC_ID environment variable not set. Set it before running Copilot.");
}

# Use whenever needed:
console.log(`Working as: ${$PC_ID}`);
```

**Pros:**
- ✅ Simple, single source of truth
- ✅ Can be set per developer/machine
- ✅ No command execution needed
- ✅ Works across all shell environments

**Setup Instructions:**
1. Add to `.env` (if using dotenv): `COPILOT_PC_ID=pc1`
2. Or add to `.bashrc` / `.zshrc`: `export COPILOT_PC_ID=pc1`
3. Or set in GitHub Actions: `COPILOT_PC_ID: pc1`

---

### Option 2: Command Detection (Alternative)
```bash
# Get machine hostname
export COPILOT_PC_ID=$(hostname | cut -d. -f1)
# Result: "miguel-laptop" → use "miguel" as PC ID

# Or git config
export COPILOT_PC_ID=$(git config user.name | cut -d' ' -f1 | tr '[:upper:]' '[:lower:]')
# Result: "Miguel De La Peña" → use "miguel" as PC ID
```

**Pros:**
- ✅ No setup needed; auto-detect
- ✅ Correlates to user identity

**Cons:**
- ❌ Less explicit (user might not know which ID is set)
- ❌ Requires shell scripting

---

### Option 3: Manual Prompt (If Needed)
```bash
# If environment variable not set, ask:
vscode/askQuestions({
  questions: [{
    header: "pc_id_setup",
    question: "What is your Copilot PC ID? (e.g., pc1, pc2, miguel)",
    options: [
      { label: "pc1" },
      { label: "pc2" },
      { label: "Other (specify)" }
    ]
  }]
})
```

**Cons:**
- ✅ Explicit and clear
- ❌ Requires user interaction every session

---

## **RECOMMENDED APPROACH:**
**Use Environment Variable (`COPILOT_PC_ID`) for production.**

**In your repo:**

### Add to `.env.example`:
```bash
# Copilot PC ID (used for branch claiming and multi-agent workflows)
# Set this to identify which Copilot instance you are
# Examples: pc1, pc2, miguel, chatgpt-1, gemini-1
COPILOT_PC_ID=pc1
```

### Add to `.github/copilot-instructions.md` (or create `.github/instructions/copilot-id.md`):
```markdown
## Copilot PC ID Setup (MANDATORY)

Before using multi-agent workflows, set your PC ID:

1. Copy `.env.example` to `.env` (if not exists)
2. Set `COPILOT_PC_ID` in `.env`:
   ```bash
   COPILOT_PC_ID=pc1   # or your specific ID
   ```
3. Verify it's loaded:
   ```bash
   echo $COPILOT_PC_ID  # Should print: pc1
   ```

**This ID is used for:**
- Branch naming: `feature/pc1/...`
- BRANCH_STATUS.md claiming: "Claimed By: pc1"
- External comments attribution: "from pc1"

**Must be unique per Copilot/Developer.**
```

### Implementation in Copilot Logic:
Add to SKILL.md new section:

```markdown
## 0.5 Identify Your PC ID (MANDATORY FIRST STEP)

Before starting ANY work:

1. Check environment variable: `echo $COPILOT_PC_ID`
2. If empty → Error:
   ```
   ERROR: COPILOT_PC_ID not set.
   
   Set it:
   - Edit .env: COPILOT_PC_ID=pc1
   - Then: source .env
   - Or: export COPILOT_PC_ID=pc1
   ```
3. If set → Proceed with workflow

**Your PC ID is: [value]**

Use this ID in:
- Branch names: `feature/[PC_ID]/...`
- BRANCH_STATUS.md claiming
- External comments attribution
```

---

## Part 2: Shared Branch Strategies

### Current Design (LOCKED Branches)
```
Branch Name: feature/pc1/login
Ownership: LOCKED (only pc1 can modify)
Access: Exclusive to pc1
```

**Problem:** What if you want PC1 + PC2 to work **together** on the same branch?

---

### New Design: Sharing Modes

**Add to BRANCH_STATUS.md and BRANCHES_STATUS.md:**

```markdown
## Sharing Mode
- **Value:** locked (or shared)
- **locked:** Only claiming PC can work; others coordinate via external comments
- **shared:** Multiple PCs can work together; use WORKING_SESSION.md to track active workers
```

---

### Sharing Mode 1: LOCKED (Current Default)

**When to Use:**
- Single PC working on a feature
- Clear ownership, no coordination overhead
- Most feature work

**BRANCH_STATUS.md:**
```markdown
## Sharing & Access Control
- **Sharing Mode:** locked
- **Claimed By:** pc1
- **Other PCs can:** Read, comment (external comments), suggest via PR review
- **Other PCs cannot:** Commit, push to this branch
```

**Branch Protection:**
- Only `pc1/` can push to `feature/pc1/...` (enforced by branch naming)
- If PC2 needs changes, they comment; PC1 implements

---

### Sharing Mode 2: SHARED (New Option)

**When to Use:**
- Pair programming / duo feature work
- Complex features needing multiple PCs
- Time zone coverage (PC1 day shift, PC2 night shift)
- Emergencies (hot bug fix, both PCs coordinate)

**BRANCH_STATUS.md:**
```markdown
## Sharing & Access Control
- **Sharing Mode:** shared
- **Claimed By:** [PC1 + PC2 work together]
- **Active Workers (Right Now):**
  - PC1: until 2026-04-07 18:00 UTC (then PC2 takes over)
  - PC2: starting 2026-04-07 18:00 UTC

## Current Working Session
> **File:** WORKING_SESSION.md (auto-updated)
> **Purpose:** Real-time tracking of who is actively coding
> **Rule:** Only ONE PC should actively code at a time (prevent merge conflicts)
```

---

### Shared Branch Mechanism: `WORKING_SESSION.md`

**Prevents race conditions even with shared access:**

```markdown
# Working Session: feature/pc1-pc2/database-migration

## Currently Working
- **Active PC:** pc1
- **Started At:** 2026-04-06 14:00 UTC
- **Estimated End:** 2026-04-06 18:00 UTC (then PC2 takes over)
- **Session ID:** 2026-04-06-pc1-session-1

## Handoff Log
- **2026-04-06 14:00:** PC1 starts session
- **2026-04-06 18:00:** PC1 commits & pushes; PC2 takes over
- **2026-04-07 02:00:** PC2 completes; PR created

## Rules for Shared Branches
1. Only ONE PC actively codes at a time
2. Before starting your session:
   - Read WORKING_SESSION.md
   - If another PC is active: wait or coordinate
3. When you finish:
   - Update WORKING_SESSION.md with handoff entry
   - Push the .md file
   - Next PC pulls and reads it
4. No simultaneous edits (would cause conflicts)
```

**Workflow for Shared Branches:**

```markdown
## PC1's Handoff to PC2 (Shared Branch)

### Before PC1 Stops:
1. Commit all changes: `git add && git commit "feat(auth): complete phase 1"`
2. Push to shared branch: `git push origin feature/pc1-pc2/database-migration`
3. Update WORKING_SESSION.md:
   ```markdown
   - **2026-04-06 18:00:** PC1 completes session; 25 commits, Phase 1 done
   - **Starting now:** PC2 takes over for Phase 2
   ```
4. Push: `git add WORKING_SESSION.md && git commit && git push`

### PC2 Takes Over:
1. Pull: `git pull origin feature/pc1-pc2/database-migration`
2. Read WORKING_SESSION.md to understand what PC1 did
3. Update WORKING_SESSION.md:
   ```markdown
   - **Active PC:** pc2
   - **Started At:** 2026-04-06 18:10 UTC
   ```
4. Push: `git add WORKING_SESSION.md && git commit && git push`
5. Continue work

**No simultaneous work → No merge conflicts.**
```

---

### Decision Matrix: LOCKED vs. SHARED

| Scenario | Mode | Reason |
|----------|------|--------|
| PC1 building login feature | LOCKED | Single PC, clear ownership |
| Emergency hotfix, both PCs available | SHARED | Fast turnaround, pair work |
| PC1 day shift, PC2 night shift coverage | SHARED | Continuous progress, handoff points |
| Complex refactor needing expertise | SHARED (with high coordination) | Needs discussion, pair review |
| Standard feature work | LOCKED | Simplest, no coordination overhead |

---

## Updated BRANCH_STATUS.md Template

Add this section:

```markdown
## Sharing & Access Control
- **Sharing Mode:** locked (or shared)
- **Claimed By:** [PC ID(s)]
  - locked mode: one PC ID
  - shared mode: list both PCs
- **Description:**
  - locked: Only claiming PC can push; others coordinate via external comments
  - shared: Multiple PCs work together; use WORKING_SESSION.md for real-time coordination

## (If Shared) Current Working Session
- **Active PC:** [PC currently working]
- **Session Start:** [Timestamp]
- **Session End (Expected):** [Timestamp or "ongoing"]
- **Session ID:** [YYYY-MM-DD-PC-session-N]
- **Purpose:** [Brief description of what this session accomplishes]

See WORKING_SESSION.md (below) for session log and handoff tracking.
```

---

## Updated BRANCHES_STATUS.md Table

Add column for sharing mode:

```markdown
| Branch Name | Owner | Type | Status | Sharing | Summary | ... |
|---|---|---|---|---|---|---|
| feature/pc1/login | pc1 | feature | active | locked | SSO login modal | ... |
| feature/pc1-pc2/db-migration | pc1, pc2 | chore | active | shared | Database schema migration; PC1 (day), PC2 (night) | ... |
```

---

## WORKING_SESSION.md Template

Create for shared branches:

```markdown
# Working Session Log: feature/[owners]/[name]

## Current Session
- **Active PC:** [PC ID]
- **Session ID:** 2026-04-06-pc1-session-1
- **Started:** 2026-04-06 14:00 UTC
- **Estimated End:** 2026-04-06 18:00 UTC (handoff to pc2)
- **Current Task:** Phase 1: Database schema setup

## Session Rules (MUST FOLLOW)
- Only ONE PC actively codes at a time
- Always update this file before/after your session
- Handoff to next PC at scheduled time
- If blocked, wait or coordinate (see external comments in BRANCH_STATUS.md)

## Handoff Log
### Session 1: 2026-04-06 14:00 (PC1)
- **Started By:** pc1
- **Completed:** 15 commits, 200 lines added
- **Achievements:** Database indexes created, no errors
- **Blockers:** None
- **Hand-off Notes:** Ready for Phase 2; all tests passing
- **Ended:** 2026-04-06 18:00 UTC

### Session 2: 2026-04-06 18:00 (PC2) [ACTIVE]
- **Started By:** pc2
- **Achievements:** [ongoing, update before handoff]
- **Current Work:** Phase 2: Migration scripts
- **Time Remaining:** ~4 hours

---

## Remember
- **Read this file before starting work** on a shared branch
- **Always update this file when you finish**
- **One PC at a time** (only exception: asynchronous code review before merge)
```

---

## Integration with Multi-Agent Workflow

### In SKILL.md Section 2 (Branching), add:

```markdown
### 2.5 Sharing Modes

Branches can be **LOCKED** (single PC) or **SHARED** (multiple PCs coordinated):

- **LOCKED Mode (Default):** `feature/pc1/login`
  - Only pc1 pushes; others coordinate via external comments
  - No simultaneous coding (branch name protection)

- **SHARED Mode:** `feature/pc1-pc2/db-migration`
  - Multiple PCs work together sequentially (not simultaneously)
  - Use WORKING_SESSION.md for real-time "who is working now" tracking
  - Only ONE PC actively codes at a time (prevent conflicts)

**When to use SHARED:**
- Pair programming / duo work
- 24/7 coverage (day/night shifts)
- Complex features needing expertise
- Emergencies (hot fixes)

**When to use LOCKED (default):**
- Single PC features (most of the time)
- Clear separation of concerns
- Minimal coordination overhead
```

---

## Risk Assessment: Shared Branches

| Risk | Mitigation |
|------|----------|
| Both PCs code simultaneously → conflicts | WORKING_SESSION.md locks who's active (only 1 at a time) |
| One PC doesn't know other PC finished | WORKING_SESSION.md updated before handoff, with git push |
| Context lost during handoff | WORKING_SESSION.md tracks accomplishments + notes |
| Merge conflicts increase | Sequential work (not parallel) prevents most conflicts |
| Race condition on WORKING_SESSION.md | Very small file, quick updates, low conflict likelihood |

**Overall: Shared mode works IF both PCs respect "only one active at a time" rule.**

---

## Recommendation

**For you and your fellow:**
1. **Start with LOCKED branches** (default)
   - Each of you claims your own branches
   - Minimal coordination overhead
   - Clear ownership

2. **Use SHARED branches rarely** (only for big features or emergencies)
   - You cover day shift, fellow covers night shift
   - Use WORKING_SESSION.md for handoff coordination
   - Example: `feature/you-fellow/critical-hotfix`

3. **Set COPILOT_PC_ID in .env:**
   - You: `COPILOT_PC_ID=you` (or your identifier)
   - Fellow: `COPILOT_PC_ID=fellow` (or their identifier)

---

## Summary

✅ **PC ID Detection:** Use `COPILOT_PC_ID` environment variable  
✅ **Sharing Modes:** LOCKED (default, single PC) or SHARED (multiple PCs coordinated)  
✅ **Race Condition Prevention:** WORKING_SESSION.md tracks who's actively working (only 1 at a time)  
✅ **Sequential, Not Parallel:** Shared branches work via handoffs, not simultaneous edits  

**This approach scales from 2 people up to N people, with zero race conditions.**

