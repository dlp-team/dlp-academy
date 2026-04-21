# 🎯 Copilot Framework - Start Here

**Last Updated:** April 6, 2026  
**Status:** ACTIVE - All copilots begin here  
**Purpose:** Navigation hub for all Copilot guidance, protocols, and workflows

---

## ⚡ QUICK START (Pick Your Path)

### 🤖 Running Autopilot?
→ **READ FIRST:** [Autopilot Execution Checklist](./ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md)  
→ Then: [Git Workflow Rules](./ACTIVE-GOVERNANCE/git-workflow-rules.md)  
→ Reference: [Branch Strategy Guide](./REFERENCE/PC_ID_AND_SHARED_BRANCHES.md)  

### 📋 Need Command Authorization?
→ [Allowed Commands](./ACTIVE-GOVERNANCE/ALLOWED_COMMANDS.md) (Go do this)  
→ [Forbidden Commands](./ACTIVE-GOVERNANCE/FORBIDDEN_COMMANDS.md) (Never do this)  
→ [Pending Commands Review Queue](./ACTIVE-GOVERNANCE/PENDING_COMMANDS.md) (In limbo?)  

### 💼 Managing Branches & Operations?
→ [Branch Status Registry](./BRANCHES_STATUS.md) (Check current branches)  
→ [Multi-Agent Quick Start](./MULTI_AGENT_QUICK_START.md) (5-min overview)  
→ [User Action Notes](./user-action-notes.md) (Manual tasks needed)  

### 🛠️ Want Specialized Workflows?
→ Navigate to `./protocols/` for step-by-step procedures
→ Navigate to `./prompts/` for reusable checklists  
→ Navigate to `./.github/skills/` for domain workflows (via orchestration)

---

## 📚 DOCUMENTATION ORGANIZATION

### ACTIVE GOVERNANCE FILES
**These are runtime rules. All copilots must follow.**

| File | Purpose | Scope |
|------|---------|-------|
| [Autopilot Execution Checklist](./ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md) | 24-step workflow for autonomous agents | ALL AUTOPILOT |
| [Git Workflow Rules](./ACTIVE-GOVERNANCE/git-workflow-rules.md) | Branch, commit, push discipline | ALL GIT OPS |
| [Allowed Commands](./ACTIVE-GOVERNANCE/ALLOWED_COMMANDS.md) | Whitelist of safe commands | AUTOPILOT ON |
| [Forbidden Commands](./ACTIVE-GOVERNANCE/FORBIDDEN_COMMANDS.md) | Blacklist of dangerous commands | AUTOPILOT ON |
| [Pending Commands](./ACTIVE-GOVERNANCE/PENDING_COMMANDS.md) | Commands awaiting user decision | AUTOPILOT ON |
| [Branch Status Registry](./BRANCHES_STATUS.md) | Global branch ledger (on development) | ALL AGENTS |
| [User Action Notes](./user-action-notes.md) | Manual follow-up tasks | ALL AGENTS |

### REFERENCE & GUIDES
**Helpful documentation, but not required for every task.**

| File | Purpose |
|------|---------|
| [Quick Start Guide](./REFERENCE/MULTI_AGENT_QUICK_START.md) | 5-minute intro to multi-agent workflows |
| [Branch Strategy Reference](./REFERENCE/PC_ID_AND_SHARED_BRANCHES.md) | How PC_IDs and branch ownership works |
| [Command Approval Matrix](./REFERENCE/COMMAND_APPROVAL_MATRIX.md) | Decision matrix for command safety |
| [Audit Plan](./DOCUMENTATION_AUDIT_AND_CLEANUP_PLAN.md) | Documentation reorganization roadmap |

### PROTOCOLS (Step-by-Step Procedures)
Located in `./protocols/`:
- **code-explanation.md** - How to document code changes
- **debug-in-depth-protocol.md** - Systematic debugging workflow
- **lossless-change-protocol.md** - Zero-regression code changes
- **plan-creation-protocol.md** - Multi-step work planning
- **temporal-cleanup-protocol.md** - Session hygiene rules
- **vscode-askQuestions-enforcement.md** - Leverage step rules (meta)
- **vscode-askQuestions-leverage-step.md** - How to execute leverage questions

### PROMPTS (Reusable Checklists)
Located in `./prompts/` - Use these when starting work in domain areas:
- api-design-review-checklist.prompt.md
- bug-triage-checklist.prompt.md
- code-review-checklist.prompt.md
- feature-implementation-checklist.prompt.md
- find-missing-tests.prompt.md
- migration-readiness-checklist.prompt.md
- performance-optimization-checklist.prompt.md
- security-audit-checklist.prompt.md

### SKILLS (Domain Workflows)
Located in `./.github/skills/` - Referenced by orchestration:
- askquestions-leverage - Enforce leverage step protocol
- create-architecture - Architecture-level planning (large-scale, mission-critical)
- create-plan - Create multi-phase work plans
- debug-in-depth - Systematic debugging
- docs-sync - Synchronize documentation
- explain-code - Update code explanations
- find-missing-tests - Audit test coverage
- git-workflow - Safe git operations
- lossless-change - Surgical code changes
- multi-agent-workflow - Coordinate multi-copilot work
- test-stabilization - Fix failing/flaky tests

### PLANNING & DOCUMENTATION
Located in `./plans/`, `./architectures/`, and `./explanations/`:
- **plans/** - Active, in-review, and finished work phases
- **architectures/** - Architecture-level plans (5–30x more thorough than plans, multi-branch, exhaustive testing)
- **explanations/codebase/** - Mirror of code patterns and architecture
- **explanations/temporal/** - Session-specific documentation and lossless reports

### ARCHIVED (Historical & Research)
Located in `./archived/`:
- **research/** - Historic analysis documents (not actively used)
- **sessions/** - Old session logs and ephemera
- **obsolete/** - Deprecated protocols or procedures

---

## 🔄 KEY WORKFLOWS

### Starting an Autopilot Task
1. Read: [Autopilot Execution Checklist](./ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md) (THIS is the complete workflow)
2. Check: [Branch Status Registry](./BRANCHES_STATUS.md) (see active branches)
3. Check: [Allowed Commands](./ACTIVE-GOVERNANCE/ALLOWED_COMMANDS.md) (verify your commands are safe)
4. Execute: Step by step per checklist (with git discipline from `git-workflow-rules.md`)
5. Gate: Use [leverage question](./protocols/vscode-askQuestions-leverage-step.md) at closure

### Managing Multi-Agent Coordination
1. Check: [BRANCHES_STATUS.md](./BRANCHES_STATUS.md) - see who owns which branch
2. Understand: [PC_ID concept](./PC_ID_AND_SHARED_BRANCHES.md) - branch ownership semantics
3. Lock your branch: Create BRANCH_LOG.md on your feature branch (per autopiolt checklist Step 4)
4. Reference: [Multi-Agent Quick Start](./MULTI_AGENT_QUICK_START.md) for coordination examples

### Writing Code Changes
1. Read: [Lossless Change Protocol](./protocols/lossless-change-protocol.md) - ensure zero regressions
2. Commit: Follow [Git Workflow](./autopilot/git-workflow-rules.md) message format
3. Document: Follow [Code Explanation](./protocols/code-explanation.md) for updating docs
4. Report: Create lossless report per [Lossless Report Template](./explanations/temporal/lossless-reports/)

### Debugging Complex Issues
1. Read: [Debug-in-Depth Protocol](./protocols/debug-in-depth-protocol.md)
2. Use skill: [debug-in-depth](../../.github/skills/debug-in-depth/) if recursive issues

---

## 🏗️ DIRECTORY STRUCTURE

```
copilot/
├── README.md (YOU ARE HERE)
├── ACTIVE-GOVERNANCE/ (NEW - future restructuring)
│   ├── AUTOPILOT_EXECUTION_CHECKLIST.md (will move)
│   ├── BRANCHES_STATUS.md (will move)
│   ├── ALLOWED_COMMANDS.md (will move)
│   ├── FORBIDDEN_COMMANDS.md (will move)
│   ├── PENDING_COMMANDS.md (will move)
│   └── user-action-notes.md (will move)
│
├── REFERENCE/ (NEW - future restructuring)
│   ├── MULTI_AGENT_QUICK_START.md (will move)
│   ├── PC_ID_AND_SHARED_BRANCHES.md (will move)
│   └── Current reference files at root level for now
│
├── autopilot/ (Current structure)
│   ├── AUTOPILOT_EXECUTION_CHECKLIST.md ⭐ CRITICAL
│   ├── ALLOWED_COMMANDS.md
│   ├── FORBIDDEN_COMMANDS.md
│   ├── PENDING_COMMANDS.md
│   ├── git-workflow-rules.md
│   └── [other files]
│
├── protocols/ (Framework procedures)
├── prompts/ (Reusable checklists)
├── plans/ (Active multi-step work)
├── explanations/ (Code documentation)
├── templates/ (Reusable templates)
├── agents/ (Copilot agent definitions)
└── archived/ (NEW - historical docs)
    ├── research/ (will receive old analysis files)
    ├── sessions/ (will receive old session logs)
    └── obsolete/ (deprecated protocols)
```

**Status:** Partial restructuring in progress. Core files remain functional at current locations. Master index above reflects current locations for immediate usability.

---

## 🚨 CRITICAL REMINDERS

### For ALL Copilots
- ✅ **Always start with** [Autopilot Execution Checklist](./autopilot/AUTOPILOT_EXECUTION_CHECKLIST.md) for autonomous work
- ✅ **Always check** [Command Whitelist/Blacklist](./autopilot/ALLOWED_COMMANDS.md) before executing commands
- ✅ **Always follow** [Git Workflow](./autopilot/git-workflow-rules.md) for commits
- ✅ **Always end with** [Leverage Question](./protocols/vscode-askQuestions-leverage-step.md) on premium requests

### For Autopilot Agents ONLY
- ✅ **Always sync** [BRANCHES_STATUS.md](./BRANCHES_STATUS.md) before branching decisions
- ✅ **Always lock** your branch with BRANCH_LOG.md (Step 4 of checklist)
- ✅ **Always use** [git-workflow skill](../.github/skills/git-workflow/) for commits

### For Human Reviewers
- ✅ **Check** lossless reports in `./explanations/temporal/lossless-reports/`
- ✅ **Verify** [user-action-notes.md](./user-action-notes.md) for manual follow-ups
- ✅ **Review** branch PRs with context from BRANCH_LOG.md

---

## 📞 NEED HELP?

**Lost?** → Start with section "QUICK START" above (pick your path)  
**Can't find something?** → Use Ctrl+F on this file or check `./archived/` for old docs  
**Want to reorganize this?** → See [Audit Plan](./DOCUMENTATION_AUDIT_AND_CLEANUP_PLAN.md)  
**Found a bug in copilot?** → Check `.github/copilot-instructions.md` baseline rules

---

**Version:** 2.0  
**Last Audit:** April 6, 2026  
**Status:** ACTIVE - All copilots use this as navigation hub  
**Next Review:** After major reorganization completion
