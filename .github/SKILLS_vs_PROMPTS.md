# Skills vs. Prompts - Clear Separation Guide

## Overview
**Skills** and **Prompts** are complementary but distinct tools for AI agents:

| Aspect | Skill | Prompt |
|--------|-------|--------|
| **Purpose** | Protocol-heavy workflows with best practices | Reusable instruction templates |
| **Complexity** | Complex, multi-step processes | Simple, one-off or standardized responses |
| **Invocation** | Auto-loaded when relevant to the task | Manually referenced or used for specific contexts |
| **Content** | Code, workflows, checklists, validation gates | Instructions, templates, examples |
| **Use Case** | Mission-critical procedures | Quick guidance, standardized templates |
| **When to Load** | When a skill applies to the request | When you need a structured approach to a task |

---

## 📋 Current Skills (Protocol-Driven Workflows)

### **Lossless Change Skill**
- **When**: Implementing fixes or features with strict no-regression requirements
- **Workflow**: Restate scope → Change surgically → Preserve behavior → Verify → Report
- **Output**: Lossless report with verification details
- **Example**: "Fix the admin dashboard button without breaking existing functionality"

### **Create Plan Skill**
- **When**: Multi-step work, migrations, risky refactors, cross-module changes
- **Workflow**: Scope definition → Phase breakdown → Validation gates → Rollback strategy
- **Output**: Complete plan package with all phases and verification steps
- **Example**: "Create a plan for migrating all Firestore collections to camelCase"

### **Debug-in-Depth Skill**
- **When**: Complex bugs, flaky tests, race conditions, permission issues
- **Workflow**: Systematic root-cause analysis → hypothesis testing → verification
- **Output**: Root cause documented with fix and prevention measures
- **Example**: "Why is this test failing intermittently?"

### **Git Workflow Skill**
- **When**: Committing, pushing, branching with strict safety rules
- **Workflow**: Branch verification → Commit formatting → Security scan → Push
- **Output**: Clean git history with safe, tracked changes
- **Example**: "Commit these changes following the format and security standards"

### **Test Stabilization Skill**
- **When**: Fixing flaky or failing test suites
- **Workflow**: Identify failures → Classify → Fix deterministically → Green validation
- **Output**: All tests passing with flakiness eliminated
- **Example**: "Make all tests pass reliably"

### **Docs-Sync Skill**
- **When**: Synchronizing plan, explanation, and lossless documentation after implementation
- **Workflow**: Collect changes → Update explanations → Update plans → Verify links
- **Output**: All documentation in sync with code
- **Example**: "Update all documentation after implementing this feature"

### **Explain-Code Skill**
- **When**: Updating or creating codebase and temporal explanation files
- **Workflow**: Document architecture → Record changes → Update changelog → Link files
- **Output**: Comprehensive explanation with change history
- **Example**: "Document this new component structure"

### **AskQuestions-Leverage Skill**
- **When**: Final closure step before completing premium requests
- **Workflow**: Execute vscode/askQuestions → Capture user intent → Propose next steps
- **Output**: Clear understanding of next steps or explicit completion confirmation
- **Example**: "Is there anything else before I finish?"

### **Multi-Agent-Workflow Skill**
- **When**: Coordinating multiple agents for complex tasks
- **Workflow**: Subagent planning → Delegation → Result aggregation → Validation
- **Output**: Coordinated multi-agent execution with clear handoffs
- **Example**: "Have different agents explore different approaches in parallel"

---

## 📝 Current Prompts (Instruction Templates)

### **Find Missing Tests Prompt**
- **When**: Auditing test coverage gaps explicitly
- **Template**: Enumerate features → Find existing tests → Identify gaps → Deduplicate
- **Output**: Deduplicated checklist of missing tests
- **Example**: "Use this prompt to find all missing tests for the admin module"

---

## 🆕 Proposed New Prompts (To Be Created)

These should be created as reusable templates for common workflows:

### **Code Review Checklist Prompt**
- **When**: Reviewing code for quality, security, and best practices
- **Template**: Points to check (naming, error handling, security, performance, documentation)
- **Output**: Standardized code review checklist
- **File**: `copilot/prompts/code-review-checklist.prompt.md`

### **Feature Implementation Checklist Prompt**
- **When**: Starting implementation of a new feature
- **Template**: Requirements gathering → Design → Implementation → Testing → Documentation
- **Output**: Standardized feature implementation workflow
- **File**: `copilot/prompts/feature-implementation-checklist.prompt.md`

### **Bug Triage Prompt**
- **When**: Quickly categorizing and prioritizing bugs
- **Template**: Bug severity → Impact assessment → Reproduction steps → Quick fix potential
- **Output**: Categorized bug with priority and action items
- **File**: `copilot/prompts/bug-triage-checklist.prompt.md`

### **Security Audit Prompt**
- **When**: Quick security checks on code or configuration
- **Template**: Credential check → Access control → Input validation → Output encoding
- **Output**: Security checklist results with findings
- **File**: `copilot/prompts/security-audit-checklist.prompt.md`

### **Performance Optimization Prompt**
- **When**: Identifying quick performance wins
- **Template**: Measure baseline → Identify hotspots → Propose optimizations → Validate
- **Output**: Performance checklist with improvements
- **File**: `copilot/prompts/performance-optimization-checklist.prompt.md`

### **API Design Review Prompt**
- **When**: Reviewing API contracts or function signatures
- **Template**: Naming conventions → Parameter design → Error handling → Documentation
- **Output**: API design review with recommendations
- **File**: `copilot/prompts/api-design-review-checklist.prompt.md`

### **Migration Readiness Prompt**
- **When**: Quick assessment of migration readiness before creating a plan
- **Template**: Dependencies → Data consistency → Rollback strategy → Communication plan
- **Output**: Migration readiness assessment
- **File**: `copilot/prompts/migration-readiness-checklist.prompt.md`

---

## 🎯 Decision Tree: Skill vs. Prompt

```
User Request
    ↓
Is this a mission-critical procedure with best practices?
    ├─ YES → Use/Create a SKILL
    │   (Examples: plan creation, lossless changes, debug-in-depth, git-workflow)
    ├─ NO → Is this a structured checklist or template?
    │   ├─ YES → Use/Create a PROMPT
    │   │   (Examples: code review, bug triage, security audit)
    │   ├─ NO → Can this be solved with standard AI reasoning?
    │       └─ YES → Use conversational chat (no skill/prompt needed)
```

---

## 📂 Future Directory Structure

```
.github/
├── skills/              → Protocol-heavy workflows
│   ├── lossless-change/
│   ├── create-plan/
│   ├── debug-in-depth/
│   ├── git-workflow/
│   ├── test-stabilization/
│   ├── docs-sync/
│   ├── explain-code/
│   ├── askquestions-leverage/
│   └── multi-agent-workflow/
└── instructions/        → Scoped rules for file types

copilot/
├── prompts/             → Reusable instruction templates
│   ├── find-missing-tests.prompt.md
│   ├── code-review-checklist.prompt.md
│   ├── feature-implementation-checklist.prompt.md
│   ├── bug-triage-checklist.prompt.md
│   ├── security-audit-checklist.prompt.md
│   ├── performance-optimization-checklist.prompt.md
│   ├── api-design-review-checklist.prompt.md
│   └── migration-readiness-checklist.prompt.md
├── explanations/        → Living documentation
├── plans/              → Project planning
└── todo/               → Workflow docs
```

---

## ✅ Implementation Steps

1. **Document this distinction** in `.github` and `copilot/` documentation
2. **Create new prompts** from template list above
3. **Update copilot-instructions.md** to reference this guide
4. **Add prompts section** to copilot-instructions.md alongside skills section
5. **Train on usage**: When to invoke each skill/prompt in different scenarios

