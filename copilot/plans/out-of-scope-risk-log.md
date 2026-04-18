<!-- copilot/plans/out-of-scope-risk-log.md -->
# Out-of-Scope Risk Log

## Purpose
Track risks discovered during implementation/review that are important but outside the current plan scope.

## Usage Rules
- Add one entry per distinct risk.
- Link the related plan/phase and impacted files.
- Keep entries actionable and concise.

## Entry Template
- Date:
- Plan/Phase:
- Related Files:
- Risk Summary:
- Why Out of Scope:
- Recommended Follow-up:
- Owner/Status:

## Entries
- Date: 2026-04-04
	Plan/Phase: [copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md](copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md)
	Related Files: [functions/security/transferPromotionApplyHandler.js](functions/security/transferPromotionApplyHandler.js), [functions/security/transferPromotionRollbackHandler.js](functions/security/transferPromotionRollbackHandler.js)
	Risk Summary: Rollback execution snapshots currently persist full student/course/class state arrays in a single rollback document and may exceed Firestore 1 MiB document limits for large institutions.
	Why Out of Scope: Initially deferred because it required a new snapshot utility layer and backward-compatible storage strategy.
	Recommended Follow-up: Implemented in Phase 05 via [functions/security/transferPromotionSnapshotUtils.js](functions/security/transferPromotionSnapshotUtils.js), [functions/security/transferPromotionApplyHandler.js](functions/security/transferPromotionApplyHandler.js), and [functions/security/transferPromotionRollbackHandler.js](functions/security/transferPromotionRollbackHandler.js). Keep fixture-backed execution evidence and periodic stress checks as closure evidence.
	Owner/Status: CLOSED - implemented 2026-04-04 in active Phase 05 block

- Date: 2026-04-04
	Plan/Phase: [copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md](copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md)
	Related Files: [functions/security/transferPromotionApplyHandler.js](functions/security/transferPromotionApplyHandler.js)
	Risk Summary: Chunked apply execution can partially commit when an error occurs mid-run, before final run/rollback status metadata is written, leaving non-atomic state transitions.
	Why Out of Scope: Initially deferred because it required explicit run-state transitions and checkpoint persistence across chunk execution.
	Recommended Follow-up: Core mitigation implemented with run states (`pending`, `applying`, `applied`, `failed`) and per-chunk checkpoints in [functions/security/transferPromotionApplyHandler.js](functions/security/transferPromotionApplyHandler.js) and [functions/security/transferPromotionRollbackHandler.js](functions/security/transferPromotionRollbackHandler.js). Non-mock transfer execution evidence is now validated via `tests/e2e/transfer-promotion.spec.js` (`3 passed`) and should be retained as closure artifact.
	Owner/Status: CLOSED - mitigation and fixture-backed non-mock evidence both complete (2026-04-04)

- Date: 2026-04-04
	Plan/Phase: [copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-09-validation-docs-review-and-closure-planned.md](copilot/plans/finished/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-09-validation-docs-review-and-closure-planned.md)
	Related Files: [copilot/protocols/lossless-change-protocol.md](copilot/protocols/lossless-change-protocol.md), [copilot/explanations/temporal/security-audit-incident-2026-03-12.md](copilot/explanations/temporal/security-audit-incident-2026-03-12.md)
	Risk Summary: Branch-wide credential scan (`git diff origin/main..HEAD`) reports historical credential-like strings from legacy docs/examples, producing repeated false-positive scan failures despite clean current commits.
	Why Out of Scope: Resolving historical branch content and sanitizing legacy documentation spans prior unrelated work blocks and requires coordinated cleanup policy.
	Recommended Follow-up: Perform dedicated branch-history/docs sanitization pass, then enforce stricter regexes for scans that differentiate real secrets from policy/example text.
	Owner/Status: CLOSED - remediation plan completed and moved to finished at [copilot/plans/finished/credential-scan-false-positive-remediation-2026-04-04/README.md](copilot/plans/finished/credential-scan-false-positive-remediation-2026-04-04/README.md)

- Date: 2026-04-28
	Plan/Phase: [copilot/plans/active/institution-admin-platform-improvements-apr-2026/phases/phase-07-optimization-inreview.md](copilot/plans/active/institution-admin-platform-improvements-apr-2026/phases/phase-07-optimization-inreview.md)
	Related Files: [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx)
	Risk Summary: `BinView.tsx` is 1052 lines, exceeding the ~500-line split threshold. This file size was pre-existing before this plan.
	Why Out of Scope: Splitting BinView safely requires extracting multiple subcomponents and re-validating selection, drag, restore, and delete flows end-to-end.
	Recommended Follow-up: Create a dedicated `home-binview-refactor` plan to extract BinHeader, BinSelectionToolbar, and BinItemList components from BinView.
	Owner/Status: CLOSED - refactor implemented 2026-04-18 via [copilot/plans/todo/home-binview-refactor-2026-04-18/README.md](copilot/plans/todo/home-binview-refactor-2026-04-18/README.md). BinView.tsx reduced from 1052 to 283 lines.
