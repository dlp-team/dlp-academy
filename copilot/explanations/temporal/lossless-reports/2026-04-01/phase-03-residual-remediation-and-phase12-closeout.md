<!-- copilot/explanations/temporal/lossless-reports/2026-04-01/phase-03-residual-remediation-and-phase12-closeout.md -->

# Lossless Report - Phase 03 Residual Remediation and Phase 12 Closeout

## Requested Scope
- Continue plan execution by resolving remaining Phase 03 residual items.
- Preserve all existing behavior outside the requested remediation scope.
- Keep plan and explanation documentation synchronized.

## Delivered Scope
- Enforced class/institution integrity in `subjects` rules for `classId` on create/update.
- Added constrained student invite-join update path in rules (least-privilege self-join only).
- Updated `useSubjects.joinSubjectByInviteCode(...)` to align student writes with constrained rules.
- Added rules coverage for:
  - class assignment allow/deny by institution,
  - student invite self-join allow,
  - extra-user join payload deny.
- Added hook unit coverage for student access vectors and strengthened invite-join enrollment assertions.
- Updated plan artifacts to mark Phase 03 residuals resolved and Phase 12 closure unblocked.
- Updated codebase explanation changelogs for touched implementation and tests.

## Out-of-Scope Behavior Explicitly Preserved
- No UI layout or navigation logic changed.
- No unrelated permission collections or rule scopes were modified.
- No broad behavior changes outside subject class assignment and invite-join update constraints.

## Touched Files
1. `firestore.rules`
2. `src/hooks/useSubjects.ts`
3. `tests/rules/firestore.rules.test.js`
4. `tests/unit/hooks/useSubjects.test.js`
5. `copilot/plans/inReview/audit-remediation-and-completion/README.md`
6. `copilot/plans/inReview/audit-remediation-and-completion/strategy-roadmap.md`
7. `copilot/plans/inReview/audit-remediation-and-completion/phases/phase-03-subject-data-enforcement.md`
8. `copilot/plans/inReview/audit-remediation-and-completion/phases/phase-12-closure-finalization.md`
9. `copilot/plans/inReview/audit-remediation-and-completion/reviewing/CLOSURE_CHECKLIST.md`
10. `copilot/plans/inReview/audit-remediation-and-completion/reviewing/PLAN_COMPLETION_SUMMARY.md`
11. `copilot/plans/inReview/audit-remediation-and-completion/reviewing/RESIDUAL_RISKS.md`
12. `copilot/explanations/codebase/firestore.rules.md`
13. `copilot/explanations/codebase/src/hooks/useSubjects.md`
14. `copilot/explanations/codebase/tests/rules/firestore.rules.test.md`
15. `copilot/explanations/codebase/tests/unit/hooks/useSubjects.test.md`

## Validation Summary
- `get_errors` on touched implementation/rules/test/docs files: clean.
- `npm run test:unit -- tests/unit/hooks/useSubjects.test.js`: pass (`31/31`).
- `npm run test:rules`: pass (`55/55`).
- `npm run lint`: pass with 0 errors, 4 pre-existing warnings.
- `npx tsc --noEmit`: pass.
- `npm run test`: pass (`101/101` files, `464/464` tests).

## Final Status
- Phase 03 residual blockers are remediated and validated.
- Phase 12 closure is complete; lifecycle transition execution is documented in:
  - `copilot/explanations/temporal/lossless-reports/2026-04-01/audit-remediation-inreview-to-finished-transition.md`
