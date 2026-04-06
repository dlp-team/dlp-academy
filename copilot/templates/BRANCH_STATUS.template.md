# BRANCH_STATUS.md Template

This file goes at the root of each feature branch immediately after creation.  
**Purpose:** Per-branch status tracking, claiming mechanism, and coordination hub.

Copy this template, fill in your details, commit, and push as your first commit on the branch.

---

# Branch Status: feature/[owner_id]/[brief-description]

## Current Work Claim
- **Claimed By:** [Your PC ID, e.g., pc1]
- **Claimed At:** [ISO timestamp, e.g., 2026-04-06T14:00:00Z]
- **Status:** active (or paused, blocked, testing, ready-for-merge, untouchable)
- **Reason (if paused/blocked):** [Brief explanation; expected resolution date if known]

## Sharing Mode
- **Mode:** locked (or shared)
- **locked:** Only claiming PC works; others coordinate via external comments (DEFAULT)
- **shared:** Multiple PCs work together sequentially via WORKING_SESSION.md handoffs (see below)

## Work Summary
[2-3 sentences describing what you're implementing. Include scope, deliverables, and why.]

### Example:
> Implementing OIDC-based SSO login modal integrated with Firebase Auth. Supports multiple identity providers (Google, Microsoft, Generic OIDC). Coordinates with existing token refresh logic to maintain backward compatibility.

## Key Files Being Modified
- [Path/to/File1.tsx](relative/path/to/File1.tsx)
- [Path/to/File2.js](relative/path/to/File2.js)
- [tests/unit/MyComponent.test.js](relative/path/to/tests/unit/MyComponent.test.js)

(Add links so future Copilots can quickly navigate to relevant code)

## Related Planning & Documentation
- **Plan:** [copilot/plans/active/plan-name/](../../plans/active/plan-name/)
- **Lossless Reports:** [copilot/explanations/temporal/lossless-reports/YYYY-MM-DD/](../../explanations/temporal/lossless-reports/YYYY-MM-DD/)
- **Explanation:** [copilot/explanations/temporal/work-name-notes.md](../../explanations/temporal/work-name-notes.md)

(Keep this section updated as work progresses; link to all artifacts)

## External Comments (For Other Copilots/Users)
> **YYYY-MM-DD HH:MM (from pc2 or user):**  
> [Their observation, question, or blockers related to this branch. Include name/ID.]

> **[Your response] YYYY-MM-DD HH:MM (from [Your PC ID]):**  
> [Your reply or action taken.]

(Append-only. Never erase past comments. Only the claiming PC can respond; others append new comments.)

## Blockers / Watch-Outs
- [Blocker 1: Description and expected resolution date/dependencies]
- [Blocker 2]
- [Potential conflicts with other active branches: specify which ones]

### Example:
- Waiting for OAuth provider to approve ID token configuration (expected 2026-04-08)
- Ensure compatibility with feature/pc2/database-migration before merge (coordinate before merging)
- Do NOT merge until external OAuth scopes are approved

## (IF SHARED MODE) Current Working Session
- **Active PC:** [Who is currently coding]
- **Session ID:** [YYYY-MM-DD-PC-session-N]
- **Session Start:** [Timestamp]
- **Session End (Estimated):** [Timestamp or "ongoing"]
- **Current Task:** [Brief description of what this session is accomplishing]

**See WORKING_SESSION.md (at branch root) for full session log and handoff tracking.**

## Merge Readiness Checklist
- [ ] All tests passing (`npm run test` returns 0 failures)
- [ ] Linting clean (`npm run lint` returns 0 errors)
- [ ] No external blockers (see above)
- [ ] Conflicts resolved with development branch
- [ ] Lossless report created and linked in Related Planning section
- [ ] All commits follow semantic format (feat, fix, chore, etc.)
- [ ] User approval for merge obtained

---

## Instructions for Claiming a Branch (LOCKED mode)

1. **Create this file immediately** after `git checkout -b <branch>`
2. **Fill in "Current Work Claim"** section with your PC ID and timestamp
3. **Set Sharing Mode: locked** (unless explicitly shared)
4. **Write concise Work Summary** (future Copilots will read this)
5. **Link all related files** and planning docs
6. **Commit and push immediately:**
   ```bash
   git add BRANCH_STATUS.md
   git commit -m "docs: claim branch for [PC ID]"
   git push origin <branch-name>
   ```
7. **Now you can safely code** — other Copilots won't touch this branch

## Instructions for SHARED Mode

1. **This branch will be worked by multiple PCs**
2. **Set Sharing Mode: shared**
3. **Create WORKING_SESSION.md** at branch root (see template for format)
4. **Only ONE PC codes at a time** (prevent simultaneous edits)
5. **On handoff:**
   - Update BRANCH_STATUS.md "Current Working Session" section
   - Update WORKING_SESSION.md with accomplishments
   - Push both files
   - Next PC pulls and reads

## Instructions for Taking Over a Branch (Any Mode)

1. **Read this file completely** to understand prior work and current blockers
2. **Check External Comments** for any coordination messages
3. **If LOCKED mode:**
   - Update "Claimed By" to your PC ID, "Claimed At" with new timestamp
4. **If SHARED mode:**
   - Update "Current Working Session": set "Active PC" to your PC ID
   - Read WORKING_SESSION.md for context
5. **Append to External Comments:**
   ```markdown
   > **YYYY-MM-DD HH:MM (from [Your PC ID]):** Taken over for continuation. Previous status: [paused/active/blocked]. Will continue with Phase X.
   ```
6. **Commit and push:**
   ```bash
   git add BRANCH_STATUS.md
   git commit -m "docs: claim branch for continuation (pc[N]->pc[M])" [if locked]
   # OR
   git add BRANCH_STATUS.md WORKING_SESSION.md
   git commit -m "docs: active session start (pc[N])" [if shared]
   git push origin <branch-name>
   ```
7. **Review linked plans and lossless reports** to understand context
8. **Proceed with work**

---

## When to Update This File

- **At least weekly** if branch is long-lived (update "Last Updated" timestamp)
- **Whenever status changes** (active → paused, blocked → active, etc.)
- **Before creating PR** (ensure checklist is up-to-date)
- **When external Copilot/user comments** (append your response, don't erase theirs)
- **Upon completion** (update to Status: ready-for-merge, mark checklist complete)
- **SHARED mode only:** Before every handoff (update Working Session details)



