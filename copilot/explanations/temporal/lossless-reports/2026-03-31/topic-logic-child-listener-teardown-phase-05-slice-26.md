<!-- copilot/explanations/temporal/lossless-reports/2026-03-31/topic-logic-child-listener-teardown-phase-05-slice-26.md -->
# Lossless Report - Phase 05 Slice 26 useTopicLogic Child Listener Teardown Hardening

## Requested Scope
Continue autonomous Phase 05 slicing with the next reliability hardening target while preserving behavior outside explicit scope.

## Delivered Scope
- Hardened nested listener lifecycle in `src/pages/Topic/hooks/useTopicLogic.js` to prevent duplicate Firestore subscriptions when the topic snapshot re-emits.
- Added `teardownTopicChildListeners` and invoked it:
  - before each child listener re-subscription (`documents`, `resumen`, `quizzes`),
  - on topic not-found fallback branch,
  - on topic listener error fallback branch,
  - on effect cleanup.
- Preserved existing child listener fallback behavior (state resets and loading transitions) while clearing stale child listener bindings and caches.
- Added focused regression coverage in `tests/unit/hooks/useTopicLogic.test.js` verifying first-generation child listeners are unsubscribed before second-generation listeners are attached on topic snapshot re-emits.

## Preserved Behaviors
- Topic/file/quiz in-page confirmation flows remain unchanged.
- Existing snapshot error toasts for `documents`, `resumen`, and `quizzes` remain unchanged.
- Topic deletion cascade behavior (including `exams` + `examns`) remains unchanged.
- Existing role/permission gating and navigation fallbacks remain unchanged.

## Touched Files
1. `src/pages/Topic/hooks/useTopicLogic.js`
2. `tests/unit/hooks/useTopicLogic.test.js`
3. `copilot/plans/active/autopilot-platform-hardening-and-completion/strategy-roadmap.md`
4. `copilot/plans/active/autopilot-platform-hardening-and-completion/phases/phase-05-subject-topic-exam-workflow-completion.md`
5. `copilot/explanations/codebase/src/pages/Topic/hooks/useTopicLogic.md`
6. `copilot/explanations/codebase/tests/unit/hooks/useTopicLogic.test.md`
7. `copilot/explanations/temporal/lossless-reports/2026-03-31/topic-logic-child-listener-teardown-phase-05-slice-26.md`

## Validation Summary
- Diagnostics:
  - `get_errors` clean for touched source and test files.
- Touched-file lint:
  - `npx eslint src/pages/Topic/hooks/useTopicLogic.js tests/unit/hooks/useTopicLogic.test.js`
  - Result: clean (no output).
- Focused tests:
  - `npx vitest run tests/unit/hooks/useTopicLogic.test.js`
  - Result: 1 file passed, 18 tests passed.
- Full suite gate:
  - `npm run test`
  - Result: 63 files passed, 348 tests passed.
- Repository lint baseline:
  - `npm run lint`
  - Result: fails due pre-existing repository lint debt outside this slice scope (e2e/rules/global process/global no-undef baseline).

## Residual Risks
- Other workflow modules with nested snapshot composition may still require equivalent listener teardown hardening.
- Repository-wide lint baseline remains outside this slice scope and continues to fail on pre-existing debt.
