// copilot/autopilot/PENDING_COMMANDS.md

# Pending Commands for Copilot Autopilot Mode

This file is for Copilot to log any command it wants to execute that is not on the allowed or forbidden list. Each entry must include:
- The command
- Description of what it does
- Pros and cons (including risks/security)
- Date logged
- Recommendation (ALLOW / FORBID / NEEDS_CLARIFICATION)

## Entry Format Template

```
---
**Command:** <exact command with placeholders if needed>
**Description:** What this command does in 1-2 sentences
**Pros:**
  - Benefit 1
  - Benefit 2

**Cons/Risks:**
  - Risk/limitation 1
  - Risk/limitation 2

**Security Concerns (if any):**
  - System access level required
  - Data modifications
  - Reversibility

**Date Logged:** YYYY-MM-DD HH:MM UTC
**Recommendation:** [ALLOW / FORBID / CLARIFY]
**User Decision:** [PENDING / APPROVED → ALLOWED / REJECTED → FORBIDDEN]
---
```

## Pending Commands

### Example Entry (DELETE THIS BEFORE USE)

---
**Command:** firebase deploy --only firestore:rules
**Description:** Deploys Firestore security rules from local firestore.rules file to production Firebase project.
**Pros:**
  - Updates security rules immediately
  - Applies latest permission changes to live environment

**Cons/Risks:**
  - Can overwrite rules with broken version
  - Risk of accidental lockout if rules are too restrictive
  - Multiple developers may be modifying simultaneously (conflicts)
  - No manual review step before deployment

**Security Concerns:**
  - Affects all users immediately
  - Could grant unintended access or deny legitimate users
  - Requires Firebase credentials/permissions
  - Irreversible without restoration from backup

**Date Logged:** 2026-04-02 12:00 UTC
**Recommendation:** FORBID
**User Decision:** REJECTED → FORBIDDEN
---

## How to Use This File

1. **When Copilot Encounters Unknown Command:**
   - Logs entry with command, description, pros/cons
   - Date-stamps the entry
   - Marks as PENDING

2. **User Reviews (Async):**
   - Read description and risks
   - Make decision: ALLOW or FORBID?
   - Update "User Decision" field

3. **Copilot Continues:**
   - On next check, moves command to appropriate list
   - ALLOWED_COMMANDS.md (if ALLOW decision)
   - FORBIDDEN_COMMANDS.md (if FORBID decision)
   - Removes from PENDING_COMMANDS.md

4. **Ongoing Maintenance:**
   - Review PENDING_COMMANDS.md periodically
   - Clear decisions build knowledge base for future autopilot runs
   - Never delete rejected commands (keep for audit trail)

## Pending Entries (Currently Waiting for Review)

**None at this time.**

---

## Archive of Recent Decisions

### ✅ Approved to ALLOWED (From this Session)

- `npm run test` — Already allowed, comprehensive test execution
- `npm run test:rules` — Already allowed, Firebase rules validation
- `npx playwright test` — Already allowed, E2E testing framework
- `git checkout -b feature/<task>` — Already allowed, safe feature branch creation
- `node scripts/run-migration.cjs` — Needs case-by-case review, database modifications

### ❌ Rejected to FORBIDDEN (From this Session)

- `firebase deploy --only firestore:rules` — Too risky, requires manual deployment review
- `firebase deploy --only firestore:indexes` — Too risky, schema changes require careful validation
- `git push -f` — Destructive, force-push rewriting history
- `git reset --hard` — Destructive, unrecoverable history loss

---

## Decision Guidelines

### ✅ ALLOW If:
- Command is non-destructive or easily reversible
- No system-level access required
- No production impact without explicit user trigger
- Safe to repeat/retry on failure
- All test/validation commands
- All read-only search/inspect commands
- All feature-branch git operations

### ❌ FORBID If:
- Production deployment impact
- Destructive without rollback capability
- Requires system-level access
- Modifies main/sensitive branches
- Requires external API credentials or manual review
- Could lock out users (permissions/auth)
- Irreversible data modifications

### ❓ CLARIFY If:
- Unclear what the command does
- Pros/cons not well understood
- Reversibility unclear
- Context-dependent safety (sometimes OK, sometimes not)
- Request more details before deciding

---

**Last Updated:** 2026-04-02  
**Status:** Active Review System  
**Entries Processed:** 0 (System ready)


