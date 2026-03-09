<!-- copilot/explanations/temporal/lossless-reports/2026-03-09/phase-04-and-05-completion-admin-rules.md -->
# Lossless Review Report

- Timestamp: 2026-03-09 local
- Task: Complete Phase 04 and Phase 05 test/rules backlog
- Request summary: Complete both remaining phases in the same batch if possible.

## 1) Requested scope
- Phase 04:
  - verify policy-save path requires sudo confirmation before success feedback,
  - add `SudoModal` wrong-password and successful-reauth unit coverage.
- Phase 05:
  - expand Firestore rules integration coverage for `institution_invites` boundaries,
  - expand `folders/topics/resources(quasi-documents)/quizzes` institution+role enforcement checks,
  - deny non-admin writes when `institutionId` missing/mismatched.

## 2) Out-of-scope preserved
- No dashboard UI redesign.
- No broad route structure refactor.
- No migration scripts changed.

## 3) Touched files
- `tests/unit/components/SudoModal.test.jsx`
- `tests/e2e/admin-guardrails.spec.js`
- `firestore.rules`
- `tests/rules/firestore.rules.test.js`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-04-admin-and-security-reinforcement.md`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-05-firestore-rules-expansion.md`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/strategy-roadmap.md`
- `copilot/explanations/temporal/phase-01-closure-and-phase-02-test-progress-2026-03-07.md`
- `copilot/explanations/codebase/tests/unit/components/SudoModal.test.md`
- `copilot/explanations/codebase/tests/e2e/admin-guardrails.spec.md`
- `copilot/explanations/codebase/tests/rules/firestore.rules.test.md`
- `copilot/explanations/codebase/firestore.rules.md`

## 4) Per-file verification (required)
### `tests/unit/components/SudoModal.test.jsx`
- Added wrong-password case: error text shown and `onConfirm` not called.
- Added successful reauth case: `onConfirm` and `onClose` called.

### `tests/e2e/admin-guardrails.spec.js`
- Strengthened policy-save flow by asserting success message is absent before confirming sudo modal.
- Existing success-after-confirm assertion preserved.

### `firestore.rules`
- Hardened `institution_invites` list/delete boundaries for role-based institution admins.
- Hardened non-admin create/update institution scoping requirements on `folders`, `topics`, `documents`, and `quizzes`.

### `tests/rules/firestore.rules.test.js`
- Reworked rules suite to validate:
  - invite create/get/list/update/delete boundaries,
  - allow paths with correct institution-role context,
  - deny paths for missing/mismatched `institutionId` on non-admin writes.

### planning/status files
- Marked all Phase 04 and Phase 05 checklist items complete.
- Updated roadmap to completed status for all phases.

## 5) Risks found + checks
- Risk: tightening rules could break legacy owner-only write paths.
- Check: added positive and negative integration assertions for intended institution-scoped writes.
- Result: emulator-backed rules tests pass with deterministic fixtures.

- Risk: full admin E2E suite may fail due unrelated credential fixture instability.
- Check: validated changed path with focused grep-run of updated policy-save test.
- Result: changed scenario passed while preserving existing suite coverage.

## 6) Validation summary
- Unit:
  - `npm run test:unit tests/unit/components/SudoModal.test.jsx`
  - Result: 1 file passed, 2 tests passed.
- E2E (changed path):
  - `npm run test:e2e tests/e2e/admin-guardrails.spec.js -- --grep "institution admin can save access policies"`
  - Result: 1 passed.
- Rules integration:
  - `npm run test:rules`
  - Result: 1 file passed, 10 tests passed.

## 7) Cleanup metadata
- Keep until: 2026-03-11 local
- Cleanup requires explicit user confirmation.
