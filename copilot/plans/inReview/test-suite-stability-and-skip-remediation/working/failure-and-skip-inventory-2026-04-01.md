<!-- copilot/plans/inReview/test-suite-stability-and-skip-remediation/working/failure-and-skip-inventory-2026-04-01.md -->
# Failure and Skip Inventory - 2026-04-01

## Run Metadata
- Workspace: dlp-academy
- Date: 2026-04-01
- Baseline commands:
  - `npm run test`
  - `npm run test:rules`
  - `npm run test:e2e`

## Unit Test Failures
- Baseline result: no failures.
- Validation result: `Test Files 71 passed (71)`, `Tests 385 passed (385)`.

## Rules Test Failures
- Baseline result: no failures.
- Validation result: `Test Files 2 passed (2)`, `Tests 44 passed (44)`.

## E2E Failures
- Baseline failures detected (`npm run test:e2e`):
  - `tests/e2e/admin-guardrails.spec.js`: invite deletion flow expected browser dialog instead of in-page confirm modal.
  - `tests/e2e/quiz-lifecycle.spec.js`: quiz start CTA assertion assumed student-mode controls in all role contexts.
  - `tests/e2e/home-sharing-roles.spec.js`: drag-drop assertion used unstable selector strategy.
- Additional failures found during hardening passes:
  - `tests/e2e/profile-settings.spec.js`: locale-sensitive heading assertion and notification toggle persistence check were flaky.
  - `tests/e2e/home-sharing-roles.spec.js`: shared-folder drag move required modal-aware and retry-aware handling.
- Final result after fixes:
  - `npm run test:e2e` => `31 passed`, `4 skipped`, `0 failed`.

## E2E Skips (Raw Inventory)
- `tests/e2e/bin-view.spec.js` -> `selecting a trashed card opens side panel`
- `tests/e2e/bin-view.spec.js` -> `bin tab persists after reload`
- `tests/e2e/branding.spec.js` -> `admin can update branding form fields`
- `tests/e2e/study-flow.spec.js` -> `create flow surfaces are available (folder/subject/topic)`

## Skip Classification
### Keep (intentional env/fixture gated)
- `tests/e2e/bin-view.spec.js` skips are guarded by `E2E_BIN_TESTS=true` and runtime fixture availability (trash content / bin tab availability).
- `tests/e2e/branding.spec.js` skip remains role-dependent when customization UI is not available for the provided E2E account.
- `tests/e2e/study-flow.spec.js` skip remains intentionally guarded by `E2E_RUN_MUTATIONS=true` to avoid accidental mutation runs.

### Remove/Fix Now
- Resolved: invite deletion confirmation path in `tests/e2e/admin-guardrails.spec.js`.
- Resolved: role-aware quiz start flow in `tests/e2e/quiz-lifecycle.spec.js`.
- Resolved: drag-drop selector and flake hardening in `tests/e2e/home-sharing-roles.spec.js`.
- Resolved: settings heading locale variance and persistence assertion flake in `tests/e2e/profile-settings.spec.js`.

### Obsolete/Dead Skip Conditions
- None identified in this pass.

## Priority Queue
1. Completed: fix and validate all active e2e failures.
2. Completed: classify all remaining skips and keep only intentional env/fixture-gated guards.
3. Completed: rerun full unit, rules, and e2e commands for closure evidence.

## Notes
- This file is updated incrementally after each diagnostic run and remediation batch.
- Final validation commands:
  - `npm run test` -> pass
  - `npm run test:rules` -> pass
  - `npm run test:e2e` -> pass with 4 intentional skips
