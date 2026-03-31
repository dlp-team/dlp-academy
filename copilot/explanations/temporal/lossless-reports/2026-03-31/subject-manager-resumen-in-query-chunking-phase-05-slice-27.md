<!-- copilot/explanations/temporal/lossless-reports/2026-03-31/subject-manager-resumen-in-query-chunking-phase-05-slice-27.md -->
# Lossless Report - Phase 05 Slice 27 useSubjectManager Resumen In-Query Chunking Hardening

## Requested Scope
Continue autonomous Phase 05 slicing with the next workflow reliability hardening target while preserving behavior outside explicit scope.

## Delivered Scope
- Hardened `src/pages/Subject/hooks/useSubjectManager.js` resumen auto-detect listener flow to avoid Firestore `in`-query overflow when many topics are in `generating` state.
- Added `MAX_IN_QUERY_VALUES = 10` and deterministic chunking of `topicId` values.
- Replaced single resumen listener with one listener per chunk while preserving existing completion promotion behavior (`status: 'completed'`).
- Added focused regression coverage in `tests/unit/hooks/useSubjectManager.test.js` verifying 12 generating topics now produce two chunked `where("topicId", "in", ...)` listeners (`10 + 2`) with full ID coverage.

## Preserved Behaviors
- Subject access validation and missing-subject redirects remain unchanged.
- Topics listener error fallback behavior (clear topics + release loading) remains unchanged.
- Topic creation, reorder, and delete flows remain unchanged.
- Topic deletion cascade integration (`cascadeDeleteTopicResources`) remains unchanged.

## Touched Files
1. `src/pages/Subject/hooks/useSubjectManager.js`
2. `tests/unit/hooks/useSubjectManager.test.js`
3. `copilot/plans/active/autopilot-platform-hardening-and-completion/strategy-roadmap.md`
4. `copilot/plans/active/autopilot-platform-hardening-and-completion/phases/phase-05-subject-topic-exam-workflow-completion.md`
5. `copilot/explanations/codebase/src/pages/Subject/hooks/useSubjectManager.md`
6. `copilot/explanations/codebase/tests/unit/hooks/useSubjectManager.test.md`
7. `copilot/explanations/temporal/lossless-reports/2026-03-31/subject-manager-resumen-in-query-chunking-phase-05-slice-27.md`

## Validation Summary
- Diagnostics:
  - `get_errors` clean for touched source and test files.
- Touched-file lint:
  - `npx eslint src/pages/Subject/hooks/useSubjectManager.js tests/unit/hooks/useSubjectManager.test.js`
  - Result: clean (no output).
- Focused tests:
  - `npx vitest run tests/unit/hooks/useSubjectManager.test.js`
  - Result: 1 file passed, 6 tests passed.
- Full suite gate:
  - `npm run test`
  - Result: 63 files passed, 349 tests passed.
- Repository lint baseline:
  - `npm run lint`
  - Result: fails due pre-existing repository lint debt outside this slice scope (existing `process/global` no-undef baseline in e2e/rules/test config files).

## Residual Risks
- Other workflows using `where("...", "in", ids)` could still require equivalent chunking if they can exceed Firestore limits.
- Repository-wide lint baseline remains outside this slice scope and continues to fail on pre-existing debt.
