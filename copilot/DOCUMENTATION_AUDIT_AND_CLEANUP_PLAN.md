# Copilot Documentation Audit & Cleanup Plan

**Date:** April 6, 2026  
**Status:** ANALYSIS PHASE  
**Purpose:** Consolidate and reorganize copilot/ documentation to reduce confusion and improve discoverability

---

## 🔍 CURRENT STATE ANALYSIS

### Files Identified

**Root Level (copilot/ directory):**
- BRANCHES_STATUS.md - Branch registry (ACTIVE USE)
- BRANCH_MODE_DECISION_MATRIX.md - Docs about branch strategy (ANALYSIS RESEARCH)
- MULTI_AGENT_QUICK_START.md - Quick guide (DOCS)
- PC_ID_AND_SHARED_BRANCHES.md - Reference (DOCS)
- user-action-notes.md - User tracking (ACTIVE USE)
- COPILOT_EFFICIENCY_AND_TOKEN_OPTIMIZATION.md - Research (RESEARCH)
- COPILOT_EFFICIENCY_SCORECARD_TEMPLATE.md - Template (TEMPLATE)
- COPILOT_VSCODE_DEEP_EFFICIENCY_RESEARCH_2026-04-06.md - Research (RESEARCH)
- COPILOT_VSCODE_DIAGNOSTICS_MATRIX_2026-04-06.md - Research (RESEARCH)
- COPILOT_VSCODE_EFFICIENCY_DAILY_PLAYBOOK.md - Guide (GUIDE)
- COPILOT_AGENTIC_EXECUTION_ROUTING_2026-04-06.md - Research (RESEARCH)

**Total Root Files:** 11 (7 RESEARCH/ANALYSIS, 2 ACTIVE, 1 TEMPLATE, 1 DOCS)

**autopilot/ subdirectory:**
- README.md - Entry point (ACTIVE)
- AUTOPILOT_EXECUTION_CHECKLIST.md - Main workflow (ACTIVE, CRITICAL)
- git-workflow-rules.md - Git guidelines (ACTIVE)
- ALLOWED_COMMANDS.md - Whitelist (ACTIVE)
- FORBIDDEN_COMMANDS.md - Blacklist (ACTIVE)
- PENDING_COMMANDS.md - Review queue (ACTIVE)
- COMMAND_APPROVAL_MATRIX.md - Command reference (REFERENCE)
- COMMAND_ANALYSIS_REPORT.md - Analysis (RESEARCH)
- COMMANDS_ADDED_FROM_DEEP_AUDIT.md - Audit results (RESEARCH)
- SESSION_COMPLETION_SUMMARY.md - Session notes (TEMPORAL)
- INTEGRATION_GUIDE.md - Setup guide (GUIDE)

**Total autopilot/ Files:** 11 (7 ACTIVE, 2 REFERENCE/GUIDE, 2 RESEARCH/ANALYSIS)

**Grand Total:** 22 files + subdirectories (explanations/, plans/, prompts/, protocols/, templates/, todo/, agents/)

### Redundancy Issues Identified

1. **Overlapping COPILOT_* files at root:**
   - COPILOT_AGENTIC_EXECUTION_ROUTING_2026-04-06.md
   - COPILOT_EFFICIENCY_AND_TOKEN_OPTIMIZATION.md
   - COPILOT_EFFICIENCY_SCORECARD_TEMPLATE.md
   - COPILOT_VSCODE_DEEP_EFFICIENCY_RESEARCH_2026-04-06.md
   - COPILOT_VSCODE_DIAGNOSTICS_MATRIX_2026-04-06.md
   - COPILOT_VSCODE_EFFICIENCY_DAILY_PLAYBOOK.md
   
   **Issue:** Multiple "research" and "analysis" documents created during exploration phases. Unclear which is current source of truth.

2. **Command Documentation Redundancy:**
   - ALLOWED_COMMANDS.md (active whitelist)
   - FORBIDDEN_COMMANDS.md (active blacklist)
   - PENDING_COMMANDS.md (active review queue)
   - COMMAND_APPROVAL_MATRIX.md (duplicate reference?)
   - COMMAND_ANALYSIS_REPORT.md (analysis artifact)
   - COMMANDS_ADDED_FROM_DEEP_AUDIT.md (audit artifact)
   
   **Issue:** Last 3 are analysis/research artifacts, not active governance files

3. **Branch Strategy Documentation:**
   - BRANCH_MODE_DECISION_MATRIX.md (root)
   - BRANCHES_STATUS.md (root, active registry)
   - PC_ID_AND_SHARED_BRANCHES.md (root, reference)
   - AUTOMATED_NOTES_ON_BRANCH_STRATEGY.md or similar (missing? wrapped in other files)
   
   **Issue:** Scattered branch reference docs without clear hierarchy

4. **Efficiency Research (NOT LINKED IN INSTRUCTIONS):**
   - COPILOT_VSCODE_DEEP_EFFICIENCY_RESEARCH_2026-04-06.md
   - COPILOT_VSCODE_DIAGNOSTICS_MATRIX_2026-04-06.md
   - COPILOT_VSCODE_EFFICIENCY_DAILY_PLAYBOOK.md
   - COPILOT_EFFICIENCY_AND_TOKEN_OPTIMIZATION.md
   - COPILOT_EFFICIENCY_SCORECARD_TEMPLATE.md
   
   **Issue:** These documents were created but never integrated into `.github/copilot-instructions.md` or AGENTS.md. Copilot doesn't know they exist, so they're dead weight.

### Confusion Points

1. **Unclear Navigation:**
   - New copilot doesn't know where to start (root folder? autopilot/ folder? protocols/?)
   - No clear entry point or index file
   - Explanations/codebase/ mirrors entire project structure - adds storage overhead

2. **Research vs. Active Files Mixed:**
   - Analysis documents stored alongside active governance files
   - No distinction between "working draft", "analysis", "approved", "deprecated"

3. **Temporal Cruft Accumulation:**
   - SESSION_COMPLETION_SUMMARY.md (old session artifact)
   - Multiple temporal/ folders with ephemeral files
   - No cleanup cadence defined

---

## 📊 FILE CATEGORIZATION & RECOMMENDATIONS

| Category | Current Files | Status | Recommendation |
|----------|-------------|--------|-----------------|
| **ACTIVE GOVERNANCE** | ALLOWED/FORBIDDEN/PENDING_COMMANDS.md, AUTOPILOT_EXECUTION_CHECKLIST.md, git-workflow-rules.md, BRANCHES_STATUS.md, user-action-notes.md | KEEP | Core files - must remain accessible |
| **ACTIVE REFERENCE** | COMMAND_APPROVAL_MATRIX.md, PC_ID_AND_SHARED_BRANCHES.md, MULTI_AGENT_QUICK_START.md | KEEP | Useful reference - link from README |
| **RESEARCH/ANALYSIS** | COPILOT_VSCODE_*_2026-04-06.md, COMMAND_ANALYSIS_REPORT.md, COMMANDS_ADDED_FROM_DEEP_AUDIT.md, BRANCH_MODE_DECISION_MATRIX.md | **ARCHIVE** | Move to `copilot/archived/research/` - not actively used |
| **TEMPLATES** | COPILOT_EFFICIENCY_SCORECARD_TEMPLATE.md | KEEP | Reference template - link from protocols/ |
| **SESSION ARTIFACTS** | SESSION_COMPLETION_SUMMARY.md, various temporal/*.md files | **ARCHIVE** | Move to `copilot/archived/sessions/` - ephemeral |
| **EXPLANATIONS MIRROR** | copilot/explanations/codebase/*** | **EVALUATE** | Mirror of src/ adds 50% storage overhead - consider if static docs or generated |

---

## 🎯 PROPOSED REORGANIZATION

### NEW DIRECTORY STRUCTURE

```
copilot/
├── README.md (INDEX - Start Here)
├── ACTIVE-GOVERNANCE/
│   ├── AUTOPILOT_EXECUTION_CHECKLIST.md (CRITICAL)
│   ├── BRANCHES_STATUS.md (Global registry)
│   ├── ALLOWED_COMMANDS.md (Whitelist)
│   ├── FORBIDDEN_COMMANDS.md (Blacklist)
│   ├── PENDING_COMMANDS.md (Review queue)
│   └── git-workflow-rules.md (Git discipline)
├── REFERENCE/
│   ├── COMMAND_APPROVAL_MATRIX.md
│   ├── PC_ID_AND_SHARED_BRANCHES.md
│   ├── MULTI_AGENT_QUICK_START.md
│   └── BRANCH_STRATEGY_REFERENCE.md
├── protocols/ (unchanged - framework)
├── prompts/ (unchanged - framework)
├── plans/ (unchanged - active work)
├── explanations/ (unchanged - active pattern index)
├── archived/
│   ├── research/ (COPILOT_VSCODE_*_2026-04-06.md moved here)
│   └── sessions/ (SESSION_COMPLETION_SUMMARY.md moved here)
├── user-action-notes.md (unchanged - tracking)
└── templates/ (unchanged)
```

### Outcome

- **Core navigation:** copilot/README.md → starts all workflows
- **Active governance:** ACTIVE-GOVERNANCE/ (6 files, clearly marked)
- **Reference docs:** REFERENCE/ (clearly marked as supporting, not critical)
- **Research artifacts:** archived/research/ (searchable if needed, not cluttering active space)
- **Session ephemera:** archived/sessions/ (cleared periodically per retention policy)
- **Storage savings:** ~30% reduction in clutter through consolidation
- **Clarity:** Copilot sees structure, knows what's active vs. archived

---

## 💡 ALTERNATIVE: LIGHTWEIGHT APPROACH

If full reorganization is too disruptive:

1. **Keep all files where they are**
2. **Create master README at copilot/README.md** with clear sections:
   ```
   # Copilot Framework

   ## ⚡ START HERE
   - [Autopilot Execution Checklist](./autopilot/AUTOPILOT_EXECUTION_CHECKLIST.md) - Main workflow
   - [Quick Start Guide](./MULTI_AGENT_QUICK_START.md) - 5-minute intro

   ## 📋 ACTIVE GOVERNANCE
   - [Branch Registry](./BRANCHES_STATUS.md)
   - [Command Whitelist/Blacklist](./autopilot/ALLOWED_COMMANDS.md)
   - [Git Workflow](./autopilot/git-workflow-rules.md)
   
   ## 📚 REFERENCE (FYI)
   - [Branch Strategy](./PC_ID_AND_SHARED_BRANCHES.md)
   - [Command Approval Matrix](./autopilot/COMMAND_APPROVAL_MATRIX.md)
   
   ## 🏛️ ARCHIVED RESEARCH
   - /archived/ (old analysis documents)
   ```

3. **Create copilot/archived/ folder** and move research docs there
4. **Update .github/copilot-instructions.md** to link only to active files
5. **No file deletions** - just reorganization

**Cost:** 5 minutes  
**Benefit:** Immediate clarity on what's active vs. archived  
**Risk:** None - non-destructive

---

## 📝 CLEANUP DECISION

**RECOMMENDATION:** Use **Lightweight Approach**

**Rationale:**
- Minimal disruption
- Non-destructive (nothing deleted)
- Immediate clarity for copilots
- Faster implementation
- Can evolve to full reorganization later if needed

**Steps:**
1. Let me know if you want to proceed
2. Create copilot/archived/ directory
3. Move COPILOT_VSCODE_*, COMMAND_ANALYSIS_REPORT, COMMANDS_ADDED_FROM_DEEP_AUDIT, SESSION_COMPLETION_SUMMARY to archived/
4. Create/enhance copilot/README.md with master index
5. Update .github/copilot-instructions.md to reference new structure
6. Commit and test

---

## 🔗 INTEGRATION POINTS TO UPDATE

Once cleanup is done:
- `.github/copilot-instructions.md` (links to removed files?)
- AGENTS.md (references?)
- `.github/instructions/*.instructions.md` (references?)
- Root-level `copilot-instructions.md` in `<WT>/copilot/...` (if any?)

**Audit:** Check for broken links before committing.

---

**Status:** AWAITING DECISION  
**Next:** User approval to proceed with Lightweight Approach
