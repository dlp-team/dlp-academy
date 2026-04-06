// copilot/prompts/feature-implementation-checklist.prompt.md
# Prompt: Feature Implementation Checklist

## Overview
Use this prompt as a structured workflow for implementing a complete feature from requirements through deployment.

## Feature Implementation Workflow

### Phase 1: Requirements & Planning
- [ ] Feature requirements are clear and documented
- [ ] Acceptance criteria are defined (what does "done" look like?)
- [ ] Impact assessment completed (what systems/users are affected?)
- [ ] Dependencies identified (does this require other work first?)
- [ ] Multi-tenancy requirements understood (is this institution-wide or specific?)
- [ ] Timeline and priority estimated
- [ ] Stakeholders aligned on scope

### Phase 2: Design & Architecture
- [ ] UI/UX design mocked or wireframed (if applicable)
- [ ] Component structure planned (which components to create/modify?)
- [ ] Data model designed (what Firestore collections/fields needed?)
- [ ] API contracts defined (if new endpoints/functions needed)
- [ ] Permission/security model designed (who can do this action?)
- [ ] Performance implications reviewed (will this scale?)
- [ ] Backward compatibility considered

### Phase 3: Implementation
- [ ] Feature branch created (git checkout -b feature/<name>)
- [ ] TypeScript-first: use .ts/.tsx, no parallel .js/.jsx
- [ ] Code organized in appropriate directories (src/components/, src/hooks/, etc.)
- [ ] Spanish text used for all UI elements
- [ ] Error handling implemented (try-catch, error states, user feedback)
- [ ] Load states implemented (show loaders, prevent double-clicks)
- [ ] Multi-tenancy enforced (institutionId scoping, permission checks)
- [ ] Firestore indexes created (if new queries added)
- [ ] Linting passes (npm run lint)

### Phase 4: Testing
- [ ] Unit tests created for utilities/hooks (~80% coverage)
- [ ] Component tests created for complex UI logic
- [ ] Integration tests created for workflows
- [ ] E2E tests created for critical user flows
- [ ] Edge cases tested (empty state, errors, permission denied)
- [ ] Tests are deterministic and not flaky
- [ ] All tests passing locally (npm run test)

### Phase 5: Review & Validation
- [ ] Code review completed (see: code-review-checklist.prompt.md)
- [ ] Security audit passed (no credentials exposed, proper access control)
- [ ] Performance baseline checked (no unexpected slowdowns)
- [ ] Browser compatibility tested (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness verified
- [ ] Accessibility checked (keyboard navigation, screen reader compatible)

### Phase 6: Documentation
- [ ] Feature documented in relevant explanation files
- [ ] File path comments added to top of new/modified files
- [ ] JSDoc added to functions, hooks, components
- [ ] README updated if user-facing workflow changed
- [ ] Changelog entry added if breaking change
- [ ] Edge cases/limitations documented

### Phase 7: Deployment Preparation
- [ ] No hardcoded credentials (all env vars)
- [ ] Environment-specific configurations handled
- [ ] Firestore rules reviewed for new feature
- [ ] Feature flags considered (if gradual rollout needed)
- [ ] Rollback plan documented (how to disable if issues arise)
- [ ] Monitoring/logging added for critical paths

### Phase 8: Git Workflow
- [ ] All changes committed with proper messages (feat/fix/docs format)
- [ ] Security scan passed (npm run security:scan:branch)
- [ ] No merge conflicts with main
- [ ] Code review approved
- [ ] Ready for merge to main

### Phase 9: Post-Deployment
- [ ] Monitor logs for errors
- [ ] Check user feedback/analytics
- [ ] Verify feature works in production
- [ ] Document any issues or adjustments needed
- [ ] Plan follow-up improvements (if any)

## Checklist by Role

### Developer
- Implements feature with tests (Phases 3-5)
- Runs linting and tests (npm run lint, npm run test)
- Follows code organization standards

### Code Reviewer
- Verifies against code-review-checklist.prompt.md
- Checks security (no credentials, proper access control)
- Validates testing coverage

### QA/Tester
- Tests edge cases and error scenarios
- Verifies browser/mobile compatibility
- Tests accessibility
- Performs integration testing

### Product Owner
- Validates acceptance criteria met
- Reviews UI/UX implementation
- Confirms deployment timeline

## Output
Track completion with:
- ✅ Completed
- 🔄 In Progress
- ⏳ Blocked (document reason)
- ❌ Deferred (document why and when to revisit)

---

**Use this prompt to ensure features are implemented completely, tested thoroughly, and documented clearly.**
