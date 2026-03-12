# Phase 08 — Full Automation in CI (COMPLETED)

## Objective

Run unit and E2E suites automatically on push/PR to block broken changes from promotion.

## Completed Changes / Actions

- Added CI gate workflow at `.github/workflows/ci-gate.yml` with 4-spec Playwright matrix:
  - `subject-topic-content`
  - `quiz-lifecycle`
  - `profile-settings`
  - `admin-guardrails`
- Added Node setup with npm cache and Playwright Chromium install.
- Added required-secret validation step to fail early when critical E2E credentials are missing.
- Configured artifact upload (`playwright-report`, `test-results`) with `if: always()` for debugging.
- Verified local parity using matrix-equivalent command:
  - `npm run test:e2e -- tests/e2e/subject-topic-content.spec.js tests/e2e/quiz-lifecycle.spec.js tests/e2e/profile-settings.spec.js tests/e2e/admin-guardrails.spec.js`
  - Result: ✅ `16` passed.

## Risks

- CI environment mismatch with local may create false negatives.
- E2E flakiness can reduce signal without retry/report tuning.

## Completion Criteria

- CI workflow is present in `.github/workflows` and executes the agreed non-onboarding matrix.
- Failing matrix jobs block the workflow by default.
- Required secret validation and artifact collection are documented in-workflow for troubleshooting.
