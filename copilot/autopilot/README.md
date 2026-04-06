// copilot/autopilot/README.md

# Autopilot Command Control System

This folder contains the command authorization framework for Copilot Autopilot mode, ensuring safe, auditable command execution while maintaining development velocity.

---

## Files in This Folder

### 🎯 AUTOPILOT_EXECUTION_CHECKLIST.md
**START HERE BEFORE EVERY AUTOPILOT TASK**

Step-by-step checklist ensuring autopilot follows ALL required steps in correct order:
- Pre-execution setup (task clarification, branch creation)
- Framework document reading requirements
- BRANCHES_STATUS.md registration (mandatory for new branches)
- Implementation phase (lossless changes, validation)
- Testing and verification gates
- Documentation requirements
- Final verification and leverage step
- Abort conditions (when to stop immediately)

**Use this for:** Every autopilot task to ensure nothing is skipped. Follow in sequence.

---

### 📋 ALLOWED_COMMANDS.md
**When to use:** Copilot checks this before executing any shell command.

Lists all commands that Copilot can execute without interruption:
- Test/validation commands (npm, npx, playwright, vitest)
- Git operations on feature branches (never main)
- File operations (mv, cp, rm, mkdir)
- NPM dependency management
- Search/utility commands (grep, find, cat)
- Firebase emulator testing

**Update:** Add commands here once they're approved and safe to always-execute.

---

### 🚫 FORBIDDEN_COMMANDS.md
**Critical Safety List**

Absolutely forbidden commands that Copilot will never execute:
- Firebase deployment (`firebase deploy`, `firebase deploy --only firestore:rules`)
- Main branch operations (`git push origin main`, `git commit --amend`)
- Force operations (`git push -f`, `git reset --hard`)
- System destructive commands (`rm -rf /`, system-level modifications)

**Violations:** Copilot MUST refuse these and report immediately.

---

### ⏳ PENDING_COMMANDS.md
**Request Queue**

Commands that Copilot wants to use but aren't on the allowed/forbidden lists:
- Database migration scripts (`node scripts/*.cjs`)
- New npm scripts not yet validated
- Any command with ambiguous safety profile

**Process:**
1. Copilot logs the command with:
   - Exact command text
   - What it does (description)
   - Pros (benefits)
   - Cons (risks, security concerns)
   - Date requested
2. User reviews in bulk
3. Move approved commands to ALLOWED_COMMANDS.md
4. Move rejected or risky commands to FORBIDDEN_COMMANDS.md

---

### 📊 COMMAND_ANALYSIS_REPORT.md
**Historical Inventory**

Analysis of **25+ commands** found across 15+ plan executions:
- What commands are actually used in practice
- Risk assessment per command
- Recommendations for allowlist/blocklist
- Links to historical plan execution

**Use this to:**
- Understand patterns in autopilot command usage
- Approve/deny pending commands with informed decisions
- Monitor for new patterns or risky requests

---

### 📄 git-workflow-rules.md
**Branch & Commit Discipline**

Strict rules for Git workflow in autopilot:
- Main branch protection (never push/commit to main)
- Branch naming convention (`feature/<task-name>`)
- Commit message format (`<type>(<scope>): <subject>`)
- Frequency guidelines (commit after each logical unit)

** Critical:** Read this before working in autopilot mode.

---

### 🧭 COMMAND_APPROVAL_MATRIX.md
**Risk Tier Governance**

Central command taxonomy for trust-by-default-deny execution:
- Category mapping (read-only, QA, local mutation, git mutation, destructive, deploy)
- Risk tier and default approval policy
- Escalation rules for unknown and semantic-conflict scenarios

**Use this as first reference** before deciding whether a command should be auto-approved, forbidden, or queued.

---

## How Copilot Uses This System

```
User Request → Autopilot Mode Enabled
    ↓
Copilot Plans Work & Identifies Commands Needed
    ↓
For Each Command:
    ├─ Is it in ALLOWED_COMMANDS.md? → ✅ EXECUTE
    ├─ Is it in FORBIDDEN_COMMANDS.md? → ❌ REFUSE & REPORT
    └─ Is it unknown? → ⏳ LOG in PENDING_COMMANDS.md & ASK USER
    ↓
User Reviews Pending Commands (async)
    ├─ Approve → Move to ALLOWED_COMMANDS.md
    ├─ Reject → Move to FORBIDDEN_COMMANDS.md
    └─ Clarify → Iterate
    ↓
Copilot Continues Execution Based on Approvals
    ↓
Work Completes → Commit and Push to Feature Branch
```

## Command Decision Priority (Operational)

1. Check [FORBIDDEN_COMMANDS.md](FORBIDDEN_COMMANDS.md) first.
2. Check [ALLOWED_COMMANDS.md](ALLOWED_COMMANDS.md).
3. If unknown, classify using [COMMAND_APPROVAL_MATRIX.md](COMMAND_APPROVAL_MATRIX.md).
4. Log in [PENDING_COMMANDS.md](PENDING_COMMANDS.md) and request user decision.
5. Do not execute until decision is recorded.

---

## Quick Start for Users

### First Time Setup
1. Read this README
2. Review [ALLOWED_COMMANDS.md](ALLOWED_COMMANDS.md) — understand what Copilot can do
3. Review [FORBIDDEN_COMMANDS.md](FORBIDDEN_COMMANDS.md) — understand hard boundaries
4. Optional: Review [COMMAND_ANALYSIS_REPORT.md](COMMAND_ANALYSIS_REPORT.md) for context

### During Autopilot Execution
- Copilot will **never** surprise you with unexpected commands
- If a command isn't on the allowed list, Copilot will ask via `vscode/askQuestions` and log in PENDING_COMMANDS.md
- You can approve/reject pending commands asynchronously
- Continue working while user reviews (no blocking)

### Adding New Allowed Commands
1. See a command in PENDING_COMMANDS.md?
2. Understand what it does (read description)
3. Assess pros/cons/risks
4. Decide: Allow → Move to ALLOWED_COMMANDS.md, Forbid → Move to FORBIDDEN_COMMANDS.md
5. Copilot automatically picks up the change on next command check

---

## Safety Principles

1. **Trust via Transparency**
   - Every command decision is logged
   - No silent executions
   - Audit trail always available

2. **Principle of Least Surprise**
   - Copilot never does something unexpected
   - Allowed commands are predictable
   - New requests trigger review

3. **Fail-Safe by Default**
   - Unknown command? → Ask instead of guess
   - Denied command? → Report immediately
   - When in doubt, add to PENDING_COMMANDS.md

4. **Branch Protection**
   - Copilot never pushes to main
   - All work on feature branches
   - Easy rollback via branch deletion

---

## Common Pending Commands & Decisions

| Command | Description | Recommendation | Notes |
|---------|---|---|---|
| `node scripts/backfill-*.cjs` | Database backfill | Case-by-case | Audit each script for reversibility |
| `npm run generate-*` | Custom generators | Case-by-case | Depends on what's generated |
| `docker run ...` | Containerization | Almost never | System dependency, not recommended |
| `Firebase functions deploy` | Deploy backend | FORBIDDEN | High risk, requires manual review |

---

## Troubleshooting

**Q: Copilot wants to run a command but it's blocked.**
- Check FORBIDDEN_COMMANDS.md for the command
- If it's actually safe, move to ALLOWED_COMMANDS.md after review
- If it's risky, confirm it's forbidden for good reason

**Q: Command keeps showing in PENDING_COMMANDS.md.**
- You haven't reviewed/approved/rejected it yet
- Copilot won't execute it until you decide
- Add to ALLOWED or FORBIDDEN, and Copilot will proceed

**Q: How do I update these files?**
- Edit directly in VS Code
- Changes take effect immediately
- Copilot checks these files before each command

**Q: What if I made a mistake with approvals?**
- Simply move the command back to PENDING or the other list
- Copilot respects the current state of these files
- No harm done, try again

---

## Hierarchy & Priority

1. **FORBIDDEN_COMMANDS.md** (Highest Priority)
   - If it's here, it NEVER executes, no exceptions

2. **ALLOWED_COMMANDS.md** (Default Allow)
   - If it's here, execute immediately

3. **PENDING_COMMANDS.md** (Request State)
   - If it's here, ask user → move after decision

4. **Unknown Commands** (Default Deny)
   - Not on any list? → Log and ask

---

## For Advanced Users: Custom Patterns

You can use wildcards in ALLOWED/FORBIDDEN:
- `npm run test:*` — Match all test variants
- `git <allowed-subcommand>` — Match git operations
- `grep -r` — Specific flag combinations

Example:
```markdown
- `npm run test*` (All test commands)
- `git checkout -b feature/*` (Feature branch creation only)
```

---

**Last Updated:** April 2, 2026  
**System:** Copilot Autopilot Command Control  
**Stability:** STABLE  
**Version:** 1.0
