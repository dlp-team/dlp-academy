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

**None at this time.**

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
