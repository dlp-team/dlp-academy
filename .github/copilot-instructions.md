# GitHub Copilot Instructions - DLP Academy

## ⚠️ CRITICAL: Premium Request Optimization

**This user has LIMITED premium requests. Every interaction must deliver MAXIMUM value.**

### Non-Negotiable Performance Standards:
1. **Read ALL relevant context BEFORE acting** - Use parallel tool calls to gather comprehensive context upfront
2. **Complete tasks fully in ONE session** - No partial work, no "I'll start with..." approaches
3. **Follow ALL protocols strictly** - Protocols in `copilot/protocols/` are mandatory, no exceptions
4. **Leverage existing documentation** - Check `copilot/explanations/` and `copilot/plans/` before asking questions
5. **Minimize back-and-forth** - Infer reasonable assumptions and document them rather than asking trivial questions
6. **Validate all changes** - Always run `get_errors` after edits and verify adjacent functionality
7. **Document comprehensively** - Update explanation files per protocol requirements

---

## Project Context

### Application Overview
**DLP Academy** is a Learning Management & Study Organization Platform built with:
- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Key Features**: Multi-institution support, role-based access (Admin, Institution Admin, Teacher, Student), content management, quizzes, study tracking
- **Architecture**: Component-based with shared modules, custom hooks, and utility functions

### Critical Domain Concepts
- **Multi-tenancy**: Users belong to institutions; data is scoped by `institutionId`
- **Permissions**: Role-based with inheritance (Admin → Institution Admin → Teacher → Student)
- **Content Hierarchy**: Subjects → Folders → Topics → Resources
- **Customization**: Institution-level theming and branding

---

## copilot/ Folder Structure & Usage

### 📁 copilot/protocols/ (MANDATORY WORKFLOWS)
Contains **strict, non-negotiable protocols** that MUST be followed for all changes:

#### 1. **lossless-change-protocol.md** (DEFAULT FOR ALL CHANGES)
- **Purpose**: Ensure zero regressions and surgical changes only
- **When**: Every code modification unless explicitly told otherwise
- **Key Rules**:
  - Change ONLY what's requested
  - Preserve all existing behavior not explicitly mentioned
  - No hidden removals of props, handlers, or logic
  - Create lossless review report in `copilot/explanations/temporal/lossless-reports/`
  - File-by-file verification required
  - Run `get_errors` after every change

#### 2. **plan-creation-protocol.md**
- **When**: Multi-step work, migrations, cross-module refactors, risky changes
- **Structure**: Plans live in `copilot/plans/` with lifecycle: `todo/` → `active/` → `inReview/` → `finished/`
- **Required Files**: `README.md`, `strategy-roadmap.md`, `phases/`, `reviewing/`

#### 3. **debug-in-depth-protocol.md**
- **When**: Debugging complex issues or tracing execution flows
- **Process**: Systematic root cause analysis with documentation

#### 4. **code-explanation.md**
- **When**: Creating or updating documentation for code changes
- **Where**: Update files in `copilot/explanations/codebase/` or `temporal/`

### 📁 copilot/plans/ (PROJECT PLANNING)
Structured planning system with clear lifecycle:

```
plans/
├── todo/           → Plans drafted but not started
├── active/         → Currently implementing
├── inReview/       → Implementation done, validating
├── finished/       → Fully verified and closed
└── archived/       → Cancelled or superseded
```

**Each plan folder contains:**
- `README.md` - Problem statement, scope, status
- `strategy-roadmap.md` - Phased approach, source of truth
- `phases/` - One file per phase with objectives and outcomes
- `reviewing/` - Verification checklists before closure

### 📁 copilot/explanations/ (LIVING DOCUMENTATION)
AI-generated explanations with dual architecture:

#### A. **codebase/** (Permanent Mirror)
- **STRICTLY mirrors** the actual project structure (`src/pages/`, `src/hooks/`, etc.)
- **File naming**: `.md` equivalents of code files (e.g., `AdminDashboard.jsx` → `AdminDashboard.md`)
- **Update rules**: DO NOT overwrite - append changelog entries with dates
- **Purpose**: Always reflects CURRENT state of the codebase

#### B. **temporal/** (Session-Based)
- **Domain-organized**: Group by feature area (`/temporal/admin/`, `/temporal/study-content/`)
- **Task-specific**: Named after the feature/change (e.g., `adding-pagination-and-filters.md`)
- **Lifecycle**: Ephemeral - contains "Before vs. After" for current work
- **Cleanup**: Ask before deleting; never delete files < 48 hours old

**Lossless Reports Location**: `temporal/lossless-reports/YYYY-MM-DD/<task-name>.md`

### 📁 copilot/todo/
Workflow documentation and task-specific guides (e.g., `shortcut-move-request-workflow.md`)

### 📄 Root-Level Guides
- `institution-customization-guide.md` - Technical reference for multi-tenant theming
- `todo-firestore-schema-cleanup.md` - Schema evolution tracking

---

## Mandatory Workflow for ALL Code Changes

### 1. Context Gathering (Parallel, Comprehensive)
```
✅ Read relevant files in copilot/explanations/codebase/
✅ Check copilot/plans/active/ for related work
✅ Search for similar patterns in the codebase
✅ Read protocol files if unfamiliar
```

### 2. Pre-Change Checklist
- [ ] Understand the EXACT requested scope
- [ ] Identify all files to touch
- [ ] List behaviors that MUST be preserved
- [ ] Check for adjacent functionality (modes, tabs, views)
- [ ] Verify no active plan conflicts

### 3. Implementation
- [ ] Make surgical, minimal changes
- [ ] Preserve all props, handlers, states not explicitly mentioned
- [ ] Maintain backward compatibility
- [ ] No scope drift or "while we're here" changes

### 4. Validation (REQUIRED)
- [ ] Run `get_errors` on all touched files
- [ ] Verify requested behavior works
- [ ] Verify adjacent behaviors still work
- [ ] Check empty/loading/error states
- [ ] Test all modes (grid/list/tree/shared if applicable)

### 5. Documentation (REQUIRED)
- [ ] Create lossless report in `temporal/lossless-reports/` with:
  - Requested scope
  - Preserved behaviors
  - Touched files list
  - Per-file verification details
  - Validation summary
- [ ] Update relevant `codebase/` explanation files (append changelog)
- [ ] Create temporal explanation if session-specific

---

## Code Patterns & Conventions

### File Organization
```
src/
├── components/
│   ├── layout/      → Shell components (Header, Sidebar, etc.)
│   ├── modals/      → Modal dialogs
│   ├── modules/     → Feature-specific reusable components
│   └── ui/          → Base UI components (buttons, inputs, etc.)
├── hooks/           → Custom React hooks (use*, e.g., useSubjects)
├── pages/           → Route-level components with panels/tabs
├── services/        → External API integrations (n8n, etc.)
├── utils/           → Pure utility functions
└── firebase/        → Firebase config and helpers
```

### Naming Conventions
- **Components**: PascalCase (e.g., `AdminDashboard.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useSubjects.js`)
- **Utils**: camelCase (e.g., `mergeUtils.js`)
- **Constants**: SCREAMING_SNAKE_CASE
- **CSS Modules**: `Component.module.css`

### Firebase Patterns
- **Collections**: camelCase (e.g., `institutionUsers`, `studyTopics`)
- **Query structure**: Use `where()` clauses for `institutionId` scoping
- **Optimistic UI**: Update local state before Firestore write
- **Error handling**: Always use try-catch with user-friendly messages

### Permission Checks
- Use `permissionUtils.js` for role-based access
- Check `institutionId` match for multi-tenant data
- Validate ownership before mutations

---

## High-Value Optimization Strategies

### 1. Batch Independent Operations
When reading context or making unrelated edits, parallelize:
```javascript
// ✅ GOOD - Parallel context gathering
[file1Content, file2Content, relatedFiles] = await Promise.all([
  read_file(file1),
  read_file(file2),
  semantic_search(query)
]);

// ❌ BAD - Sequential reads
await read_file(file1);
await read_file(file2);
await semantic_search(query);
```

### 2. Use multi_replace_string_in_file for Multiple Edits
When changing multiple files or multiple locations, use `multi_replace_string_in_file` instead of sequential `replace_string_in_file` calls.

### 3. Proactive Error Detection
Always run `get_errors` immediately after edits - don't wait for user to report issues.

### 4. Leverage Semantic Search Early
Before multiple grep searches, try one broad semantic search to understand the landscape.

### 5. Complete Work in Single Session
- Don't stop at "I've made the first change..."
- Don't ask "Should I continue?" unless genuinely ambiguous
- Finish validation, documentation, and verification before yielding

---

## Key Files to Know

### Configuration
- `vite.config.js` - Vite build configuration
- `firebase.json` - Firebase hosting/functions config
- `firestore.rules` - Security rules (critical for multi-tenancy)
- `eslint.config.js` - Linting rules

### Critical Utilities
- `src/utils/permissionUtils.js` - Role-based access control
- `src/utils/securityUtils.js` - Security helpers
- `src/utils/themeTokens.js` - Theme customization system
- `src/hooks/useSubjects.js` - Subject data management
- `src/hooks/useInstitutionBranding.js` - Multi-tenant branding

### Layout Components
- `src/components/layout/Header.jsx` - Navigation bar
- `src/components/layout/Sidebar.jsx` - Side navigation
- `src/pages/Home/Home.jsx` - Landing page with theming

---

## When Things Go Wrong

### If You Break Something
1. **Acknowledge immediately** - Don't hide it
2. **Analyze the break** - Use debug protocol
3. **Fix surgically** - Minimal change to restore
4. **Document in lossless report** - What broke, why, how fixed
5. **Re-validate fully** - Ensure fix doesn't introduce new issues

### If Scope is Unclear
1. **State your interpretation** - "I understand you want X, which means Y changes"
2. **List assumptions** - "I'm assuming A, B, C remain unchanged"
3. **Proceed with safest path** - Choose the most lossless approach
4. **Document assumptions** - In lossless report

### If Multiple Approaches Exist
1. **Choose the most lossless** - Least disruption wins
2. **Explain trade-offs briefly** - "Using approach X because it preserves Y"
3. **Implement fully** - Don't stop to ask which approach

---

## Premium Request Value Checklist

Before completing ANY interaction, verify:
- [ ] Task is 100% complete (not 80%, not "started")
- [ ] All required protocols followed
- [ ] All validation steps completed
- [ ] All documentation updated
- [ ] No errors remain (`get_errors` clean)
- [ ] Lossless report created (if code changed)
- [ ] User can immediately continue their work without asking follow-ups

**Remember: Every interaction uses a limited premium request. Make each one count.**

---

## Quick Reference

### Most Common Workflows

1. **Bug Fix**: Follow lossless protocol → Fix surgically → Validate → Document
2. **New Feature**: Check plans → Implement → Validate → Update codebase/ explanation → Create temporal/ explanation
3. **Refactor**: Create plan if multi-step → Follow lossless protocol → Validate exhaustively
4. **Migration**: ALWAYS create plan → Follow plan protocol → Document in phases/
5. **Documentation Request**: Check existing explanations → Update codebase/ → Add changelog

### Protocol Priority
1. **Lossless Change Protocol** - Default for everything
2. **Plan Creation Protocol** - Multi-step or risky work
3. **Debug Protocol** - Complex issues
4. **Code Explanation Protocol** - Documentation updates

---

## Final Directive

**You have ONE job**: Deliver complete, validated, documented solutions that maximize the value of each limited premium request. No partial work. No "let me know if you want me to continue." No cutting corners on validation or documentation. 

**Every session should leave the user thinking: "That was worth it."**
