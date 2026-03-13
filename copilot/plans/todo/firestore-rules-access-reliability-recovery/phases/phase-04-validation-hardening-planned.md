# Phase 04 - Validation Hardening (PLANNED)

## Objective
Prove reliability and security with real workflow tests.

## Test Strategy
### A) Rules/authorization-focused tests
- Add or update tests under `tests/rules` to verify allow/deny boundaries per role and resource.
- Include explicit negative tests for unauthorized move/delete/read attempts.

### B) E2E tests (real workflow)
- Prioritize and extend:
  - `tests/e2e/home-sharing-roles.spec.js`
  - `tests/e2e/study-flow.spec.js`
  - `tests/e2e/subject-topic-content.spec.js`
  - `tests/e2e/bin-view.spec.js`
- Add drag/drop + delete assertions for owner/editor/viewer role matrix.

### C) Regression passes
- Targeted suites first, then full e2e pass.

## Completion Criteria
- Targeted tests pass for all fixed operations.
- Full suite pass has no new permission regressions.
- Failure matrix marked resolved with evidence references.