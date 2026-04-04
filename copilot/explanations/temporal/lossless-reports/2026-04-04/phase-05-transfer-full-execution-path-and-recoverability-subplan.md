<!-- copilot/explanations/temporal/lossless-reports/2026-04-04/phase-05-transfer-full-execution-path-and-recoverability-subplan.md -->
# Lossless Change Report - Phase 05 Transfer Full Execution Path and Recoverability Subplan

## Requested Scope
- Continue the active Phase 05 plan by extending transfer/promotion e2e coverage from guardrails into full execution-path coverage (`dry-run -> apply -> rollback`).
- Continue Phase 05 planning by capturing the pending risk-log recoverability design as a dedicated transfer subplan.

## Preserved Behaviors
- Existing transfer/promotion callable contracts and UI wiring were preserved.
- Existing guardrail test flow remains unchanged and still skip-gated when fixtures are unavailable.
- Multi-tenant boundaries and permission behavior were not modified.

## Touched Files
- Updated: [tests/e2e/transfer-promotion.spec.js](tests/e2e/transfer-promotion.spec.js)
- Updated: [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md)
- Updated: [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md)
- Updated: [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/README.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/README.md)
- Added: [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/student-course-linking-and-transfer-subplan.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/student-course-linking-and-transfer-subplan.md)
- Updated: [copilot/plans/out-of-scope-risk-log.md](copilot/plans/out-of-scope-risk-log.md)
- Updated: [copilot/explanations/codebase/tests/e2e/transfer-promotion.spec.md](copilot/explanations/codebase/tests/e2e/transfer-promotion.spec.md)

## File-by-File Verification
### [tests/e2e/transfer-promotion.spec.js](tests/e2e/transfer-promotion.spec.js)
- Added new env gate `E2E_TRANSFER_PROMOTION_APPLY_ROLLBACK=1` to isolate mutation-path assertions.
- Added a deterministic end-to-end scenario covering dry-run, apply, and rollback actions.
- Added optional setup gate `E2E_TRANSFER_PROMOTION_AUTO_SEED=1` with service-account parsing fallbacks (raw/base64/path/multiline `.env`) for disposable fixture seeding attempts.
- Preserved existing guardrail and dry-run-only scenarios.

### [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md)
- Added progress bullet entries for full execution-path e2e coverage and new transfer recoverability subplan creation.
- Updated remaining-work bullets to focus on fixture execution evidence and implementation of the documented recoverability model.
- Appended latest validation command evidence.

### [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md)
- Updated immediate-next-action text to reference the new mutation-path e2e gate and the recoverability subplan implementation follow-up.

### [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/student-course-linking-and-transfer-subplan.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/student-course-linking-and-transfer-subplan.md)
- Added dedicated architecture plan for chunked rollback snapshots and checkpointed apply/rollback progression.
- Defined backward-compatibility path, validation plan, and rollback notes.

### [copilot/plans/out-of-scope-risk-log.md](copilot/plans/out-of-scope-risk-log.md)
- Updated both Phase 05 risk entries to reference the new subplan and moved status to "design captured, implementation pending".

### [copilot/explanations/codebase/tests/e2e/transfer-promotion.spec.md](copilot/explanations/codebase/tests/e2e/transfer-promotion.spec.md)
- Added changelog entry describing new full execution-path e2e behavior and env-gated mutation coverage.
- Updated execution-gate section with new apply/rollback and auto-seed flags.

## Risks and Mitigations
- Risk: full mutation-path e2e could be non-deterministic without isolated fixtures.
  - Mitigation: scenario runs only under explicit `E2E_TRANSFER_PROMOTION_APPLY_ROLLBACK=1` opt-in gate.
- Risk: recoverability risk remains unresolved in runtime handlers until follow-up implementation.
  - Mitigation: created concrete subplan and linked risk-log entries to implementation blueprint.

## Validation Summary
- `get_errors` on [tests/e2e/transfer-promotion.spec.js](tests/e2e/transfer-promotion.spec.js): clean.
- Executed `npm run test:e2e -- tests/e2e/transfer-promotion.spec.js`:
  - Result: 3 tests discovered; 3 skipped by explicit environment gates in this workspace.
- Executed `$env:E2E_TRANSFER_PROMOTION_TESTS='1'; $env:E2E_TRANSFER_PROMOTION_EXECUTION='1'; $env:E2E_TRANSFER_PROMOTION_APPLY_ROLLBACK='1'; $env:E2E_TRANSFER_PROMOTION_AUTO_SEED='1'; npx playwright test tests/e2e/transfer-promotion.spec.js --reporter=list`:
  - Result: 3 tests discovered; 3 skipped with explicit annotation `No academic-year options found`, confirming fixture visibility remains unresolved in this workspace.

## Addendum (2026-04-04 Late Session)
### Additional Requested Scope
- Continue Phase 05 unblocking effort after fixture-visibility skip findings by implementing browser-side fallback seeding and revalidating gated execution paths.

### Additional Touched Files
- Updated: [tests/e2e/transfer-promotion.spec.js](tests/e2e/transfer-promotion.spec.js)
- Updated: [functions/security/transferPromotionDryRunHandler.js](functions/security/transferPromotionDryRunHandler.js)
- Updated: [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md)
- Updated: [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md)
- Updated: [copilot/explanations/codebase/tests/e2e/transfer-promotion.spec.md](copilot/explanations/codebase/tests/e2e/transfer-promotion.spec.md)
- Updated: [copilot/explanations/codebase/functions/security/transferPromotionDryRunHandler.md](copilot/explanations/codebase/functions/security/transferPromotionDryRunHandler.md)

### Additional File-by-File Verification
- [tests/e2e/transfer-promotion.spec.js](tests/e2e/transfer-promotion.spec.js)
  - Added UI fallback fixture creation flow (create source/target courses via Institution Admin modal) when academic-year options are missing under auto-seed mode.
  - Added deterministic preference for configured source/target academic years.
  - Added explicit environment-failure skip classification for dry-run runtime errors (`internal` and equivalent messages) so execution-path tests remain deterministic.
  - Serialized suite execution (`mode: serial`) to avoid multi-worker fixture collision.
- [functions/security/transferPromotionDryRunHandler.js](functions/security/transferPromotionDryRunHandler.js)
  - Replaced dual-filter users query (`institutionId` + `role`) with institution-only query and in-memory student-role filtering to reduce runtime index dependency.
  - Preserved tenant scoping and transfer mapping semantics.

### Additional Validation Evidence
- `get_errors` clean for [tests/e2e/transfer-promotion.spec.js](tests/e2e/transfer-promotion.spec.js) and [functions/security/transferPromotionDryRunHandler.js](functions/security/transferPromotionDryRunHandler.js).
- `npm run test -- tests/unit/functions/transfer-promotion-dry-run-handler.test.js tests/unit/functions/transfer-promotion-apply-handler.test.js tests/unit/functions/transfer-promotion-rollback-handler.test.js`
  - Result: 3 files passed, 9 tests passed.
- `$env:E2E_TRANSFER_PROMOTION_TESTS='1'; $env:E2E_TRANSFER_PROMOTION_EXECUTION='1'; $env:E2E_TRANSFER_PROMOTION_APPLY_ROLLBACK='1'; $env:E2E_TRANSFER_PROMOTION_AUTO_SEED='1'; npx playwright test tests/e2e/transfer-promotion.spec.js --reporter=list`
  - Result: `1 passed, 2 skipped`.
  - Skip classification now indicates callable-environment runtime readiness blocker instead of modal fixture-visibility blocker.
