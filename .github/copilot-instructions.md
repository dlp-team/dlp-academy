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
8. **Maximize code organization & efficiency** - Create new files when needed, split oversized files, centralize logic for maintainability
9. **Use premium requests at 200% efficiency** - Premium requests are limited and cost money; every request must deliver maximum completed value (implementation + validation + documentation), never just partial progress
10. **Do not stop momentum for minor uncertainty** - Ask concise in-task clarifying questions with `vscode/askQuestions`, then continue immediately with the safest lossless path in the same request
11. **Do not pause due to broad modified-file noise** - If the user has said to continue, proceed on current scope and avoid blocking prompts about unrelated local changes unless there is a direct conflict in touched files
12. **No low-value premium turns** - Never return with only minor wording tweaks or tiny partial edits when the user asked for a full deliverable; bundle substantial, end-to-end output in the same request.
13. **Minimum completion payload** - For plan requests, you MUST deliver a fully executable plan package (scope, phased steps, validation gates, rollback, and testing strategy), not just brief bullet additions.
14. **No artificial stopping** - Do not stop after a small change if additional requested work remains; continue autonomously until all requested outcomes are completed.

16. **vscode/askQuestions Leverage Step Enforcement (CRITICAL, NO EXCEPTIONS)** - The agent MUST ALWAYS execute the `vscode/askQuestions` leverage step before completing any premium request. This protocol supersedes all other completion logic and is enforced in every completion flow, for all agent modes and workflows. If the tool fails, the agent must document the failure and request user direction before ending the session. No exceptions.
17. **vscode/askQuestions Leverage Step Enforcement (CRITICAL, NO EXCEPTIONS)** - The agent MUST ALWAYS execute the `vscode/askQuestions` leverage step before completing any premium request, using a concise prompt (<200 characters). This protocol supersedes all other completion logic and is enforced in every completion flow, for all agent modes and workflows. If the tool fails (e.g., input too long, tool unavailable), the agent must document the failure and request user direction before ending the session. No exceptions.

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

## Code Organization & Efficiency Standards

### Mandatory Principles

#### 1. File Organization Strategy
- **Create new files proactively**: When adding complex logic, create dedicated utility/helper files rather than bloating existing files
- **Split oversized files**: If a file exceeds ~500 lines or has multiple distinct concerns, split it into focused modules
- **Centralize reusable logic**: Extract duplicated code into shared utilities, hooks, or components
- **Follow the single responsibility principle**: Each file should have one clear purpose

#### 2. When to Create New Files
✅ **Create a new file when:**
- Adding a new utility function that could be reused elsewhere
- Implementing a feature that's 100+ lines and self-contained
- Multiple components/files would benefit from shared logic
- A file is growing beyond 500 lines
- Logic is becoming hard to navigate or maintain

❌ **Don't create a new file when:**
- The logic is tightly coupled to a single component (< 50 lines)
- It's a one-off helper used only once
- The existing file is well-organized and < 300 lines

#### 3. Code Centralization Checklist
Before implementing, check if similar logic exists:
- [ ] Search for existing utilities in `src/utils/`
- [ ] Check for relevant hooks in `src/hooks/`
- [ ] Look for similar patterns in `src/components/modules/`
- [ ] Review `copilot/explanations/codebase/` for documentation
- [ ] If duplicating logic, extract to shared location instead

#### 4. File Splitting Strategy
When a file needs splitting:
1. **Identify distinct concerns** (e.g., UI logic vs. data logic vs. utilities)
2. **Extract to appropriate locations**:
   - Pure functions → `src/utils/`
   - React hooks → `src/hooks/`
   - Reusable components → `src/components/modules/`
   - UI primitives → `src/components/ui/`
3. **Maintain backward compatibility** - Update imports carefully
4. **Document the split** - Update explanation files
5. **Validate thoroughly** - Ensure no broken imports

### Example: Good vs. Bad Organization

**❌ BAD - Bloated component:**
```jsx
// AdminDashboard.jsx (800 lines)
// - Component logic
// - Data fetching logic
// - Utility functions
// - Validation functions
// - Formatting helpers
```

**✅ GOOD - Organized structure:**
```jsx
// AdminDashboard.jsx (200 lines) - UI logic only
// hooks/useAdminData.js (100 lines) - Data fetching
// utils/adminValidation.js (80 lines) - Validation
// utils/adminFormatters.js (60 lines) - Formatting
```

---

## Asking Clarifying Questions (Without Stopping)

### When to Ask Questions
Use `vscode/askQuestions` tool to ask clarifying questions **without stopping the task** when:
- **Ambiguity in requirements** - Multiple valid interpretations exist
- **Major architectural decisions** - Choice significantly impacts structure
- **Out-of-scope concerns** - Request seems to extend beyond stated scope
- **Risk of breaking changes** - Change might affect multiple systems
- **File organization choices** - Uncertain where new code should live

### Question Guidelines
✅ **DO ask about:**
- "This could mean X or Y - which approach?"
- "Should I split this 600-line file now or handle it separately?"
- "This change affects authentication - proceed or create a plan?"
- "Extract to new utility file or keep inline?"

❌ **DON'T ask about:**
- Trivial formatting choices (use existing patterns)
- Standard conventions (follow the codebase style)
- Minor parameter names (choose sensible defaults)
- Whether to validate (always validate)

### Using vscode/askQuestions
```javascript
// Ask questions INLINE without stopping the task
await vscode/askQuestions({
  questions: [
    {
      header: "File Split Decision",
      question: "AdminDashboard.jsx is 650 lines. Split now or separate task?",
      options: [
        { label: "Split now", recommended: true },
        { label: "Separate task" },
        { label: "Keep as-is" }
      ]
    }
  ]
});
```

**After receiving answers, continue immediately with the task.**

### Premium Continuation Rule (Critical)
- Questions must be **in-task**, not blockers.
- Never consume a premium request only to ask whether to continue when a safe continuation path exists.
- Prefer: ask 1 focused question, document assumptions, continue implementation, validate, and ship completed increments.

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


### 1. Context Gathering & Pre-Execution Clarification (Parallel, Comprehensive)
```
✅ Read relevant files in copilot/explanations/codebase/
✅ Check copilot/plans/active/ for related work
✅ Search for similar patterns in the codebase
✅ Read protocol files if unfamiliar
✅ Before making any changes, ensure the task is fully understood. If there is any ambiguity, missing detail, or uncertainty about requirements, use `vscode/askQuestions` to clarify with the user before proceeding. Do not proceed until the scope, constraints, and expected outcomes are clear.
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
- [ ] Apply code organization standards (extract utils, centralize logic)
- [ ] Use `vscode/askQuestions` if major decisions needed (don't wait)

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
- **Naming Language**: All Firestore collection names, document field names, and schema identifiers must be in English for consistency and professionalism (e.g., `quizzes`, `documents`, `exams`, not `cuestionarios`, `documentos`, `exámenes`)
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
1. **Use `vscode/askQuestions`** - Ask specific questions inline without stopping
2. **State your interpretation** - "I understand you want X, which means Y changes"
3. **List assumptions** - "I'm assuming A, B, C remain unchanged"
4. **Proceed with safest path** - Choose the most lossless approach
5. **Document assumptions** - In lossless report

### If Multiple Approaches Exist
1. **Ask via `vscode/askQuestions` if significant** - Major architectural impacts warrant quick clarification
2. **Choose the most lossless** - Least disruption wins if minor
3. **Explain trade-offs briefly** - "Using approach X because it preserves Y"
4. **Implement fully** - Don't stop to deliberate; ask and proceed

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
- [ ] **Pre-execution clarification performed:** If there was any ambiguity or missing information, the agent asked the user for clarification and only proceeded once the task was fully understood.
- [ ] **No low-value handoff:** The response includes substantial completed output proportional to user scope (not minor edits only).
- [ ] **Plan requests fully packaged:** If the user asked for a plan, all required plan artifacts were produced in this same request.
- [ ] **Final leverage question executed:** A `vscode/askQuestions` follow-up was sent before closing the request (unless the tool failed, in which case failure was explicitly documented).

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

### User Preferences

1. **Icons over Emojis**: Avoid using emojis for any visible web elements. Use icons instead for a professional and consistent look.
2. **Text-Based Info Instead of Alerts**: Do not use browser alerts for displaying information. Instead, display the information as text on or near the related element for better user experience and context.
3. **Spanish Text Only**: All visible text must be written in Spanish and adhere to proper grammar and style as a native Spanish speaker would write.
4. **English for Chat**: All communication in the chat must be in English.

---

## File Path Comment

Each file must include its path as a comment at the very beginning (e.g., `// src/pages/Profile/components/UserCard.jsx`).
