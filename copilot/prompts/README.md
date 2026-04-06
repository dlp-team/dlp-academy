// copilot/prompts/README.md
# Copilot Prompts - Reusable Instruction Templates

## Overview

Prompts are reusable instruction templates and checklists designed to guide AI agents through structured workflows. Unlike **Skills** (which are protocol-heavy and automatically loaded when relevant), **Prompts** are templates you reference when you need a structured approach to a task.

**See:** [.github/SKILLS_vs_PROMPTS.md](.github/SKILLS_vs_PROMPTS.md) for the detailed distinction between skills and prompts.

---

## 📋 Available Prompts

### 1. **Code Review Checklist** 
**File:** `code-review-checklist.prompt.md`  
**When to use:** Reviewing code for quality, security, and best practices  
**Covers:**
- Naming & readability
- Error handling
- Security checks (credentials, permissions, validation)
- Performance
- Firebase/data patterns
- Testing coverage
- Documentation
- Code organization
- Maintainability
- Git hygiene

**Example Usage:**
> "Use the code-review-checklist prompt to review this PR for quality and security."

---

### 2. **Feature Implementation Checklist**
**File:** `feature-implementation-checklist.prompt.md`  
**When to use:** Starting implementation of a new feature, end-to-end workflow  
**Covers:**
- Requirements & planning
- Design & architecture
- Implementation (TypeScript-first, Spanish text, error handling)
- Testing (unit, component, integration, e2e)
- Review & validation (code review, security, performance, accessibility)
- Documentation
- Deployment preparation
- Git workflow
- Post-deployment monitoring

**Example Usage:**
> "I need to implement a feature for student progress tracking. Use the feature-implementation-checklist to guide this."

---

### 3. **Bug Triage Checklist**
**File:** `bug-triage-checklist.prompt.md`  
**When to use:** Quickly categorizing and prioritizing bugs  
**Covers:**
- Bug information gathering (details, reproduction steps)
- Impact assessment
- Severity classification (CRITICAL, HIGH, MEDIUM, LOW)
- Resolution complexity (QUICK, STANDARD, COMPLEX)
- Root cause assessment
- Quick fix potential
- Triage decision tree

**Example Usage:**
> "Use the bug-triage checklist to assess the severity of this reported issue."

---

### 4. **Security Audit Checklist**
**File:** `security-audit-checklist.prompt.md`  
**When to use:** Quick security checks on code or configuration  
**Covers:**
- Credential security (no hardcoded keys, env vars only)
- Access control (multi-tenancy, permissions)
- Firebase security (rules, auth)
- Input validation (XSS, SQL injection)
- Data protection (PII, sensitive info)
- API security
- Dependency security (npm audit)
- Error handling
- Authentication & sessions
- Deployment security

**Example Usage:**
> "Before deploying, run the security-audit-checklist on this code."

---

### 5. **Performance Optimization Checklist**
**File:** `performance-optimization-checklist.prompt.md`  
**When to use:** Identifying and implementing performance improvements  
**Covers:**
- Baseline measurement (metrics, Chrome DevTools)
- Bundle size analysis
- React/component performance (re-renders, memoization)
- Firebase/data fetching (queries, indexes, caching)
- Asset optimization (images, fonts, CSS)
- Network performance
- Runtime performance
- Database indexes
- Caching strategy
- Monitoring & profiling

**Example Usage:**
> "The admin dashboard is slow. Use the performance-optimization-checklist to find the bottleneck."

---

### 6. **API Design Review Checklist**
**File:** `api-design-review-checklist.prompt.md`  
**When to use:** Reviewing API contracts, function signatures, interfaces  
**Covers:**
- Naming conventions (verbs for functions, nouns for resources, camelCase, etc.)
- Parameters & arguments
- Return types
- Error handling
- Immutability & side effects
- Versioning & backward compatibility
- Documentation & JSDoc
- Firebase/Firestore patterns
- TypeScript compliance
- React hooks (if applicable)

**Example Usage:**
> "Review this new API design before we commit to it."

---

### 7. **Migration Readiness Checklist**
**File:** `migration-readiness-checklist.prompt.md`  
**When to use:** Quick assessment of migration readiness BEFORE creating a detailed plan  
**Covers:**
- Migration scope
- Dependencies & blockers
- Data consistency
- Backward compatibility
- Testing strategy
- Communication plan
- Monitoring & observability
- Security & compliance
- Infrastructure & resources
- Rollback & recovery

**Example Usage:**
> "Use the migration-readiness-checklist to assess if we're ready to migrate to Firestore."

**Note:** After using this prompt, use the **create-plan** skill if the migration is approved.

---

### 8. **Find Missing Tests Prompt**
**File:** `find-missing-tests.prompt.md`  
**When to use:** Auditing test coverage gaps for features  
**Covers:**
- Feature enumeration
- Existing test mapping
- Gap identification
- Deduplication
- Actionable test checklist

**Example Usage:**
> "Use the find-missing-tests prompt to identify untested code paths in the admin module."

**Note:** After identifying gaps, use the **test-stabilization** skill to fix flaky tests, or create tests as needed.

---

## 🎯 How to Use Prompts

### In Chat (Direct Reference)
```
"Use the code-review-checklist prompt to review this implementation."
"Follow the feature-implementation-checklist for this work."
"Apply the security-audit-checklist before committing."
```

### In Documentation
Reference the prompt file directly:
```markdown
For security checks, see [security-audit-checklist.prompt.md](copilot/prompts/security-audit-checklist.prompt.md).
```

### As Context Mentions
You can mention a prompt file directly in chat:
```
> Use #code-review-checklist to review this code.
```

---

## 📊 Skills vs. Prompts: Quick Reference

| Aspect | Skill | Prompt |
|--------|-------|--------|
| **When** | Mission-critical procedure | Structured checklist/template |
| **Invocation** | Auto-loaded when relevant | Manually referenced for context |
| **Complexity** | Complex, multi-step | Simple, one-off or standardized |
| **Examples** | create-plan, lossless-change, debug-in-depth | code-review, bug-triage, security-audit |
| **Output** | Validated result with gates | Completed checklist or assessment |

---

## 🚀 Decision Tree: When to Use Which Prompt

```
Task or Question
    ↓
Is this a code review?
    ├─ YES → Use code-review-checklist
    └─ NO → Is this implementing a feature?
            ├─ YES → Use feature-implementation-checklist
            └─ NO → Is this a bug?
                    ├─ YES → Use bug-triage-checklist
                    └─ NO → Is this a security concern?
                            ├─ YES → Use security-audit-checklist
                            └─ NO → Is performance the issue?
                                    ├─ YES → Use performance-optimization-checklist
                                    └─ NO → Is this an API?
                                            ├─ YES → Use api-design-review-checklist
                                            └─ NO → Is this a migration?
                                                    ├─ YES → Use migration-readiness-checklist
                                                    └─ NO → Is this a test gap?
                                                            ├─ YES → Use find-missing-tests
                                                            └─ NO → Use conversational chat
```

---

## 📝 Creating New Prompts

When a new prompt is needed:

1. **Identify the use case:** What structured workflow or checklist is missing?
2. **Create the file:** `<descriptive-name>.prompt.md` in `copilot/prompts/`
3. **Follow the template:**
   ```markdown
   // copilot/prompts/<name>.prompt.md
   # Prompt: <Title>
   
   ## Overview
   [What this prompt is for]
   
   ## Checklist/Workflow
   [Steps and checkpoints]
   
   ## Output
   [What to deliver]
   
   ## Examples
   [Usage examples]
   ```
4. **Update this README:** Add the prompt to the "Available Prompts" section
5. **Update copilot-instructions.md:** Add to the prompts routing section

---

## 🔗 Related Documentation

- [SKILLS_vs_PROMPTS.md](.github/SKILLS_vs_PROMPTS.md) - Detailed distinction
- [copilot-instructions.md](.github/copilot-instructions.md) - Main copilot config
- [copilot/plans/](.../copilot/plans/) - Project planning (uses skills)
- [.github/skills/](.github/skills/) - Protocol-heavy workflows (skills)

---

**Last Updated:** 2026-04-06  
**Maintainer:** Copilot & Team
