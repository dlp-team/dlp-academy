// copilot/prompts/code-review-checklist.prompt.md
# Prompt: Code Review Checklist

## Overview
Use this prompt to systematically review code for quality, security, best practices, and maintainability.

## Code Review Checklist

### 1. **Naming & Readability**
- [ ] Variable/function names are clear and descriptive
- [ ] Names follow conventions (camelCase for variables, PascalCase for components)
- [ ] Comments explain "why", not "what"
- [ ] Complex logic has explanatory comments
- [ ] File structure is logical and organized

### 2. **Error Handling**
- [ ] All promises have `.catch()` or try-catch
- [ ] Error messages are user-friendly (Spanish for UI, descriptive for logs)
- [ ] Edge cases are handled (null, undefined, empty arrays)
- [ ] Loading and error states are shown to users
- [ ] Failures don't crash the app or leave invalid state

### 3. **Security** 🔒
- [ ] No hardcoded credentials or API keys (use env vars)
- [ ] Input validation/sanitization present where needed
- [ ] Permission checks enforce multi-tenant isolation (institutionId scoping)
- [ ] No SQL injection vulnerabilities (using parameterized queries)
- [ ] Authentication/authorization flows are correct

### 4. **Performance**
- [ ] No unnecessary re-renders (memoization where appropriate)
- [ ] Queries are indexed or optimized
- [ ] No N+1 query patterns
- [ ] Large lists use pagination or virtualization
- [ ] Bundle size impact is minimal for new dependencies

### 5. **Firebase/Data**
- [ ] Firestore queries use proper indexes
- [ ] Data is scoped by `institutionId` (multi-tenancy)
- [ ] Firestore rules validate the same constraints
- [ ] Write operations are atomic where needed
- [ ] Real-time listeners are properly cleaned up

### 6. **Testing**
- [ ] Code has corresponding unit or e2e tests
- [ ] Edge cases and error paths are tested
- [ ] Tests are deterministic (no flaky timing)
- [ ] Mocks are used appropriately
- [ ] Test coverage for critical paths is >= 80%

### 7. **Documentation**
- [ ] Function/component has JSDoc or comment (especially complex logic)
- [ ] Props/parameters are documented
- [ ] Complex algorithms are explained
- [ ] File path comment at top of file
- [ ] Breaking changes are documented

### 8. **Code Organization**
- [ ] File size is reasonable (~300-500 lines max)
- [ ] Related logic is grouped together
- [ ] No duplicate or similar code (DRY principle)
- [ ] Imports are organized (external, then relative, then utils)
- [ ] Unused imports are removed

### 9. **Maintainability**
- [ ] Code follows team conventions
- [ ] TypeScript is used; no untyped variables
- [ ] No magic numbers (extract to constants)
- [ ] Loops/conditions are straightforward and readable
- [ ] Temporary workarounds have TODO comments with context

### 10. **Git Hygiene**
- [ ] Commit messages follow format: `<type>(<scope>): <subject>`
- [ ] Changes are logical and focused (not massive random refactors)
- [ ] No console.log, debugger, or commented-out code left behind
- [ ] Line count is reasonable for review

## Output
Document review with:
- ✅ Passes (things done well)
- ⚠️ Concerns (things to address)
- 🔴 Blockers (must fix before merge)
- 💡 Suggestions (nice-to-haves or future improvements)

---

**Use this prompt to guide thorough code reviews ensuring quality, security, and maintainability.**
