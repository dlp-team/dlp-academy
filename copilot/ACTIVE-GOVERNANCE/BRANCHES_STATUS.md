# Repository Branches Status

**Last Updated:** 2026-04-07  
**Purpose:** Global registry of all active feature/fix/chore branches. Single source of truth for understanding what work is happening across the repo.

**Instructions:**
- Add a new row when creating a branch (include Type, Owner, current Status, related Plan, key files, etc.)
- Only modify rows that contain your `owner_id/` (e.g., if your branch is `feature/pc1/login`, only pc1 edits that row)
- Append-only: Never delete rows; use Status column to indicate completion/archival instead
- Update "Last Updated" before pushing any status changes
- Link to related plans and key files for fast navigation

---

| Branch Name | Owner | Type | Status | Summary | Related Plan | Key Files | Last Updated | Notes |
|---|---|---|---|---|---|---|---|---|
| feature/hector/original-plan-execution-2026-0407 | hector | feature | active | Execute ORIGINAL_PLAN autopilot backlog with phased lossless delivery | copilot/plans/active/original-plan-autopilot-2026-04-07/ | src/pages/Home/**, src/pages/InstitutionAdminDashboard/**, src/pages/Topic/**, src/components/**, src/styles/** | 2026-04-07 | Branch created from development under checklist workflow |

---

## Legend

**Status Values:**
- `active` — Currently being worked on
- `paused` — Temporarily stopped (see Notes for reason)
- `blocked` — Cannot proceed without external input (see Notes)
- `ready-for-merge` — Work complete, PR created, awaiting merge confirmation
- `testing` — Experimental branch, do not merge to production
- `untouchable` — Reserved branch, do not modify without permission
- `archived` — Completed work, merged, preserved for history only

**Type Values:**
- `feature` — New capability or user-facing change
- `fix` — Bug fix or regression correction
- `chore` — Internal refactoring, dependency update, tooling
- `experiment` — Exploratory work, not intended for production merge

---

## Example Entries (For Reference)

| Branch Name | Owner | Type | Status | Summary | Related Plan | Key Files | Last Updated | Notes |
|---|---|---|---|---|---|---|---|---|
| feature/pc1/login-overlay | pc1 | feature | active | Implementing OIDC-based SSO login modal | copilot/plans/active/login-overlay/ | src/components/modals/LoginOverlay.jsx, src/firebase/auth.js | 2026-04-06 10:30 | Using external OIDC provider; blocked on OAuth approval |
| fix/pc2/auth-token-refresh | pc2 | fix | ready-for-merge | Fix null reference in token refresh during logout | copilot/plans/finished/auth-token-fix/ | src/hooks/useAuth.js, tests/unit/useAuth.test.js | 2026-04-06 08:15 | All tests passing, awaiting merge confirmation |

---

## Updating This File

When you create a new branch:
1. Run: `git fetch origin && git checkout development && git pull origin development`
2. Create your branch: `git checkout -b <type>/<owner_id>/<description>`
3. Create BRANCH_STATUS.md on that branch (see template in copilot/templates/ or .github/skills/multi-agent-workflow/SKILL.md)
4. Return to development: `git checkout development`
5. Edit this file (BRANCHES_STATUS.md) and add your row
6. Commit and push: `git add copilot/BRANCHES_STATUS.md && git commit -m "chore(branches): add feature/pc1/..." && git push origin development`

After merge, update Status column (don't delete the row):
1. Update Status to `archived` (preserves history)
2. Push the change: `git add copilot/BRANCHES_STATUS.md && git commit -m "chore(branches): archive feature/..." && git push origin development`

