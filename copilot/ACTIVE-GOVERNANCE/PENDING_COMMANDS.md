// copilot/autopilot/PENDING_COMMANDS.md

# Pending Commands for Copilot Autopilot Mode

This file is the review queue for commands that are neither explicitly allowed nor explicitly forbidden.

## Entry Template

---
**Command:** <exact command with placeholders>
**Category:** <read-only | qa | local-mutation | git-mutation | external-state | unknown>
**Description:** What this command does in 1-2 sentences
**Scope of Impact:** <files, branch, environment>
**Pros:**
  - Benefit 1
  - Benefit 2

**Cons/Risks:**
  - Risk 1
  - Risk 2

**Risk Tier:** <Low | Medium | High | Critical>
**Rollback Plan:** <how to undo if command causes issues>

**Security Concerns:**
  - Credentials/secrets risk
  - Data or permission impact
  - Reversibility

**Date Logged:** YYYY-MM-DD HH:MM UTC
**Recommendation:** [ALLOW / FORBID / CLARIFY]
**User Decision:** [PENDING / APPROVED -> ALLOWED / REJECTED -> FORBIDDEN]
---

## Pending Commands

---
**Command:** git fetch origin
**Category:** git-mutation
**Description:** Fetches updated remote refs and commit objects without modifying working files.
**Scope of Impact:** Local git metadata and remote-tracking refs
**Pros:**
  - Ensures local branch decisions use latest remote state
  - Reduces branch collision and stale-merge risk

**Cons/Risks:**
  - Can reveal remote divergence requiring conflict handling
  - Slightly expands local git object store

**Risk Tier:** Low
**Rollback Plan:** No rollback needed; refs can be reset by checking out target branch and pulling desired state.

**Security Concerns:**
  - No direct credential exposure in workspace files
  - No code or data mutation by itself
  - Fully reversible at branch-state level

**Date Logged:** 2026-04-07 00:00 UTC
**Recommendation:** ALLOW
**User Decision:** APPROVED -> ALLOWED
---

---
**Command:** git pull origin development
**Category:** git-mutation
**Description:** Updates local development branch with latest commits from remote development.
**Scope of Impact:** Local development branch history and working tree
**Pros:**
  - Aligns branch decisions and status docs with latest team state
  - Reduces downstream merge conflicts in feature branches

**Cons/Risks:**
  - May introduce merge conflicts if local branch is dirty
  - Can alter local branch tip unexpectedly without review

**Risk Tier:** Medium
**Rollback Plan:** Use non-destructive revert commit if needed; avoid destructive resets.

**Security Concerns:**
  - No credential material should be introduced
  - Changes are auditable via git history
  - Limited to repository state

**Date Logged:** 2026-04-07 00:00 UTC
**Recommendation:** ALLOW
**User Decision:** APPROVED -> ALLOWED
---

---
**Command:** gh pr create --base development --title "<title>" --body "<body>"
**Category:** git-mutation
**Description:** Creates a pull request from the current feature branch into development with a documented summary body.
**Scope of Impact:** GitHub PR metadata only (no code changes)
**Pros:**
  - Enables checklist-required autonomous PR flow
  - Preserves auditable merge context linked to branch work

**Cons/Risks:**
  - Wrong base/title/body can create PR noise
  - Requires authenticated GitHub CLI session

**Risk Tier:** Low
**Rollback Plan:** Close or edit the PR if metadata is incorrect.

**Security Concerns:**
  - No credential contents are written to repository files
  - No direct source-code mutation
  - Fully reversible by closing PR

**Date Logged:** 2026-04-07 14:05 UTC
**Recommendation:** ALLOW
**User Decision:** APPROVED -> ALLOWED
---

---
**Command:** gh pr merge --squash --delete-branch
**Category:** git-mutation
**Description:** Merges the active pull request into development using squash strategy and removes the remote branch.
**Scope of Impact:** Remote repository branch history and branch lifecycle state
**Pros:**
  - Completes checklist finalization and keeps history clean
  - Automatically removes stale feature branch after merge

**Cons/Risks:**
  - Irreversible branch lifecycle transition if run on wrong PR
  - Requires all validations and review conditions to be satisfied first

**Risk Tier:** Medium
**Rollback Plan:** Recreate branch from commit hash and revert merge commit on development if needed.

**Security Concerns:**
  - No credential material written to repository files
  - Changes are auditable in remote commit history
  - Merge operation is high-impact but traceable

**Date Logged:** 2026-04-07 14:05 UTC
**Recommendation:** ALLOW
**User Decision:** APPROVED -> ALLOWED
---

---
**Command:** gh pr view --json statusCheckRollup,state,number
**Category:** read-only
**Description:** Retrieves pull request state and CI check results to validate merge readiness.
**Scope of Impact:** Read-only GitHub metadata query
**Pros:**
  - Enables deterministic Step 20 checks validation
  - Avoids guessing CI readiness

**Cons/Risks:**
  - Requires authenticated GitHub CLI session
  - Might fail if current branch has no PR

**Risk Tier:** Low
**Rollback Plan:** No rollback needed; read-only command.

**Security Concerns:**
  - No file or git-history mutation
  - No credential content persisted in repo
  - Fully reversible/no-op

**Date Logged:** 2026-04-07 14:05 UTC
**Recommendation:** ALLOW
**User Decision:** APPROVED -> ALLOWED
---

## Review Process
1. Copilot logs unknown command here before execution.
2. User reviews command and sets decision.
3. Approved commands move to `ALLOWED_COMMANDS.md`.
4. Rejected commands move to `FORBIDDEN_COMMANDS.md`.
5. Entry is archived after decision with timestamp.

## Decision Rules
- Use [COMMAND_APPROVAL_MATRIX.md](COMMAND_APPROVAL_MATRIX.md) for risk tiering.
- Default policy is deny-until-reviewed for unknown commands.
- Commands affecting production or history rewrite should default to FORBID.
