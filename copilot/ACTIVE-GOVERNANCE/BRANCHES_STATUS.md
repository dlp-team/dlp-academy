<!-- copilot/ACTIVE-GOVERNANCE/BRANCHES_STATUS.md -->
# Repository Branches Status

**Last Updated:** 2026-04-12
**Purpose:** Global registry of all active feature/fix/chore branches. Single source of truth for understanding what work is happening across the repo.

**Retention Policy:** See [copilot/ACTIVE-GOVERNANCE/BRANCH_RETENTION_POLICY.md](./BRANCH_RETENTION_POLICY.md) for auto-deletion rules and grace periods.

**Instructions:**
- Add a new row when creating a branch (include Type, Owner, current Status, related Plan, key files, etc.)
- Only modify rows that contain your `owner_id/` (e.g., if your branch is `feature/pc1/login`, only pc1 edits that row)
- After successful merge into development: Set Status to `pending-delete` and record Pending-Delete Date
- Branches with Status `pending-delete` are auto-deleted after 7 days (see retention policy)
- If a branch should be retained permanently (e.g., security audit), set Status to `retained` and document reason in Notes
- Update "Last Updated" before pushing any status changes
- Link to related plans and key files for fast navigation

---

| Branch Name | Owner | Type | Status | Pending-Delete Date | Summary | Related Plan | Key Files | Last Updated | Notes |
|---|---|---|---|---|---|---|---|---|---|
| feature/autopilot-workflow-updates-2026-04-09 | hector | feature | active | — | Continue AUTOPILOT execution with explicit plan lineage (2026-04-09 predecessor + 2026-04-10 active continuation) | copilot/plans/active/autopilot-plan-execution-2026-04-10/ ; copilot/plans/finished/autopilot-plan-execution-2026-04-09/ | BRANCH_LOG.md, copilot/plans/active/autopilot-plan-execution-2026-04-10/**, copilot/plans/finished/autopilot-plan-execution-2026-04-09/**, copilot/ACTIVE-GOVERNANCE/BRANCHES_STATUS.md | 2026-04-10 | Lock: locked-private; checklist Step 6 complete, implementation Step 7+ pending; prior same-branch plan preserved in BRANCH_LOG lineage registry; human merge approval required in BRANCH_LOG | 
| feature/hector/autopilot-plan-notifications-topic-2026-0412 | hector | feature | active | — | Execute AUTOPILOT_PLAN notifications unification, direct messaging, and Topic study guide permissions fix | copilot/plans/active/autopilot-plan-notifications-topic-2026-04-12/ | src/pages/Home/**, src/pages/Topic/**, src/components/**, src/hooks/**, src/firebase/**, src/utils/** | 2026-04-12 | Lock: pending BRANCH_LOG initialization |
| feature/hector/autopilot-plan-execution-2026-0408 | hector | feature | pending-delete | 2026-04-08 | Execute AUTOPILOT_PLAN checklist with phased implementation and validation | copilot/plans/finished/autopilot-plan-execution-2026-04-08/ | src/pages/Home/**, src/pages/InstitutionAdminDashboard/**, src/pages/Topic/**, src/components/**, src/hooks/**, src/utils/**, functions/** | 2026-04-08 | Lock: locked-private; merged into development on 2026-04-08; scheduled for auto-deletion on 2026-04-15 |
| feature/hector/original-plan-execution-2026-0407 | hector | feature | pending-delete | 2026-04-07 | Execute ORIGINAL_PLAN autopilot backlog with phased lossless delivery | copilot/plans/active/original-plan-autopilot-2026-04-07/ | src/pages/Home/**, src/pages/InstitutionAdminDashboard/**, src/pages/Topic/**, src/components/**, src/styles/** | 2026-04-07 | Merged into development on 2026-04-07; will be auto-deleted on 2026-04-14 |
| gemini-opt | hector | feature | pending-delete | 2026-04-07 | Gemini optimization and documentation reorganization | N/A | copilot/** | 2026-04-07 | Legacy branch, pre-BRANCHES_STATUS; scheduled for auto-deletion on 2026-04-14 |

---

## Legend

**Status Values:**
- `active` — Currently being worked on
- `paused` — Temporarily stopped (see Notes for reason)
- `blocked` — Cannot proceed without external input (see Notes)
- `ready-for-merge` — Work complete, PR created, awaiting merge confirmation
- `testing` — Experimental branch, do not merge to production
- `untouchable` — Reserved branch, do not modify without permission
- `pending-delete` — Merged successfully, scheduled for auto-deletion after 7-day grace period (see Pending-Delete Date)
- `retained` — Merged but retained for audit/compliance; will NOT be auto-deleted (see Notes for reason)
- `archived` — Completed work, merged, preserved for history ONLY (legacy, replaced by pending-delete/retained)

**Type Values:**
- `feature` — New capability or user-facing change
- `fix` — Bug fix or regression correction
- `chore` — Internal refactoring, dependency update, tooling
- `experiment` — Exploratory work, not intended for production merge

---

## Example Entries (For Reference)

| Branch Name | Owner | Type | Status | Pending-Delete Date | Summary | Related Plan | Key Files | Last Updated | Notes |
|---|---|---|---|---|---|---|---|---|---|
| feature/pc1/login-overlay | pc1 | feature | active | — | Implementing OIDC-based SSO login modal | copilot/plans/active/login-overlay/ | src/components/modals/LoginOverlay.jsx, src/firebase/auth.js | 2026-04-06 10:30 | Using external OIDC provider; blocked on OAuth approval |
| fix/pc2/auth-token-refresh | pc2 | fix | pending-delete | 2026-04-04 | Fix null reference in token refresh during logout | copilot/plans/finished/auth-token-fix/ | src/hooks/useAuth.js, tests/unit/useAuth.test.js | 2026-04-06 08:15 | Merged 2026-04-04; will be auto-deleted on 2026-04-11 |

---

## Updating This File

When you create a new branch:
1. Run: `git fetch origin && git checkout development && git pull origin development`
2. Create your branch: `git checkout -b <type>/<owner_id>/<description>`
3. Create BRANCH_LOG.md on that branch (see template in copilot/templates/ or .github/skills/multi-agent-workflow/SKILL.md)
4. Return to development: `git checkout development`
5. Edit this file (BRANCHES_STATUS.md) and add your row with Pending-Delete Date set to `—` (active branches have no deletion date)
6. Commit and push: `git add copilot/BRANCHES_STATUS.md && git commit -m "chore(branches): add feature/pc1/..." && git push origin development`

**After successful merge into development (Step 22 of AUTOPILOT_EXECUTION_CHECKLIST):**

1. Verify merge validation gates passed
2. Update BRANCHES_STATUS.md row for merged branch:
   - Set Status: `pending-delete` (NOT ~~archived~~)
   - Set Pending-Delete Date: Today's date (YYYY-MM-DD)
   - Append Notes: "Merged on [date]; will be auto-deleted on [date + 7 days]"
3. Commit and push: `git add copilot/BRANCHES_STATUS.md && git commit -m "chore(branches): mark feature/... as pending-delete"`
4. Copilot will automatically detect and delete expired branches (7 days after pending-delete-date) during Step 22.5 (Cleanup Phase)

**If a branch should be retained permanently:**
1. Set Status: `retained` (NOT `pending-delete`)
2. Document reason in Notes: "Retained for [reason] until [date or indefinitely]"
3. This branch will NEVER be auto-deleted

