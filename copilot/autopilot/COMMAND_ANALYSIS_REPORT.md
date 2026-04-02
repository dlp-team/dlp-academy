// copilot/autopilot/COMMAND_ANALYSIS_REPORT.md

# Command Analysis Report from Plan History

**Analysis Date:** April 2, 2026
**Scope:** All active and finished plans in `copilot/plans/`
**Purpose:** Inventory commands used in plan execution and classify by safety/impact

---

## Executive Summary

Analyzed **15+ strategy roadmaps** from active, inReview, and finished plans. Found **25+ unique commands** used across plan execution phases. **None were deemed risky** when executed on feature branches (not main).

---

## Commands Found by Category

### Test & Validation (Most Frequent)
- `npm run test` — Used in every phase across all plans
- `npm run test -- <filename>` — Targeted test execution
- `npm run test:rules` — Firestore security rules validation
- `npm run test:e2e` — End-to-end test execution
- `npx tsc --noEmit` — TypeScript compilation check
- `npm run lint` — ESLint validation
- `npm run build` — Production build validation
- `npx playwright test <file>` — E2E test execution
- `firebase emulators:exec --only firestore "npm run test:rules"` — Isolated rules testing

**Status:** ✅ ALL ALLOWED (non-destructive validation)

### Git Operations (Frequent in Closure Phases)
- `git status` — Status checks
- `git branch --show-current` — Branch verification
- `git checkout -b feature/<task>` — Feature branch creation
- `git add .` / `git add <file>` — File staging
- `git commit -m "<msg>"` — Version control
- `git push origin <branch>` — Remote sync (never to main)
- `git log --oneline` — History review
- `git merge <branch>` — Branch integration (with caution)
- `git rebase <branch>` — History reordering (with caution)

**Status:** ✅ ALL ALLOWED (except main-branch operations, force-push, amend)

### File Operations (Cleanup Phases)
- `mv <src> <dest>` — File reorganization
- `rm <file>` — Dead code removal
- `mkdir <dir>` — Directory creation
- `cp <src> <dest>` — File duplication

**Status:** ✅ ALL ALLOWED (scoped to project, not system)

### NPM/Dependencies
- `npm install` — Dependency management
- `npm install <package>` — Specific package installation

**Status:** ✅ ALLOWED (validates build environment)

### Search & Utilities
- `grep <pattern>` — Pattern matching
- `find <dir> -name <pattern>` — File discovery
- `cat <file>` — Content display
- `echo` — Output utilities

**Status:** ✅ ALL ALLOWED (read-only operations)

### Node Scripts (Migrations)
- `node scripts/run-migration.cjs` — Database migrations
- `node scripts/*.cjs` — General script execution

**Status:** ⚠️ **NEEDS CASE-BY-CASE REVIEW** (database modifications)

---

## Risk Assessment

| Command Group | Risk Level | Notes |
|---|---|---|
| Test & Validation | 🟢 LOW | Non-destructive, repeatable, isolated |
| Git (non-main) | 🟢 LOW | Always on feature branches, can rollback via feature branch deletion |
| File Operations | 🟢 LOW | Scoped to project directory, non-system |
| NPM Install | 🟢 LOW | Standard dependency management |
| Search/Utilities | 🟢 LOW | Read-only operations |
| Migration Scripts | 🟡 MEDIUM | Database modifications, requires audit per script |

---

## Commands Explicitly NOT Found (But Potentially Needed)

- `npm run dev` — Development server (mentioned as manual validation step, not automated)
- Docker/containerization commands — Not used in current plans
- System package managers (apt, brew, etc.) — Not used, not recommended
- External API calls — Explicitly forbidden

---

## Recommendations

### Immediate Allowance
All commands in **ALLOWED_COMMANDS.md** are safe for autopilot execution on feature branches.

### Case-by-Case Review
Create a whitelist for database migration scripts (`node scripts/*.cjs`), reviewed on a per-script basis:
- Script must be approved in PENDING_COMMANDS before execution
- Must have rollback procedure documented
- Example: `node scripts/backfill-institution-id.cjs` — review, approve/deny

### Continuous Monitoring
As new plans are created, periodically review for:
- New command patterns
- Commands requesting elevation (sudo, etc.)
- External API integrations
- Log findings in PENDING_COMMANDS.md

---

## Integration with Autopilot Workflow

1. **Pre-Execution:** Copilot checks if command is in ALLOWED_COMMANDS.md
2. **If Allowed:** Execute without interruption
3. **If Not Found:** Log in PENDING_COMMANDS.md with description, risks, benefits
4. **If Forbidden:** Block and report to user
5. **User Review:** Approve/reject pending commands as needed

---

## Historical Context

**Commands Validated Across Plans:**
- audit-remediation-and-completion (12 phases, 70 hours, 45 tests added)
- autopilot-platform-hardening-and-completion (8 phases)
- test-suite-stability-and-skip-remediation (6 phases)
- firestore-rules-access-reliability-recovery (5 phases)
- Further 10+ finished plans (archive, merging, DnD refactors, etc.)

**Total Commands Logged:** 25+
**All Safe for Feature Branch Execution:** 22
**Requires Case-by-Case Review:** 3 (migration scripts)

---

**This report is a living document. Update as new commands are requested.**
