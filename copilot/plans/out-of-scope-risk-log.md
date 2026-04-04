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
	Plan/Phase: [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md)
	Related Files: [functions/security/transferPromotionApplyHandler.js](functions/security/transferPromotionApplyHandler.js), [functions/security/transferPromotionRollbackHandler.js](functions/security/transferPromotionRollbackHandler.js)
	Risk Summary: Rollback execution snapshots currently persist full student/course/class state arrays in a single rollback document and may exceed Firestore 1 MiB document limits for large institutions.
	Why Out of Scope: Initially deferred because it required a new snapshot utility layer and backward-compatible storage strategy.
	Recommended Follow-up: Implemented in Phase 05 via [functions/security/transferPromotionSnapshotUtils.js](functions/security/transferPromotionSnapshotUtils.js), [functions/security/transferPromotionApplyHandler.js](functions/security/transferPromotionApplyHandler.js), and [functions/security/transferPromotionRollbackHandler.js](functions/security/transferPromotionRollbackHandler.js). Keep fixture-backed execution evidence and periodic stress checks as closure evidence.
	Owner/Status: CLOSED - implemented 2026-04-04 in active Phase 05 block

- Date: 2026-04-04
	Plan/Phase: [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md)
	Related Files: [functions/security/transferPromotionApplyHandler.js](functions/security/transferPromotionApplyHandler.js)
	Risk Summary: Chunked apply execution can partially commit when an error occurs mid-run, before final run/rollback status metadata is written, leaving non-atomic state transitions.
	Why Out of Scope: Initially deferred because it required explicit run-state transitions and checkpoint persistence across chunk execution.
	Recommended Follow-up: Core mitigation implemented with run states (`pending`, `applying`, `applied`, `failed`) and per-chunk checkpoints in [functions/security/transferPromotionApplyHandler.js](functions/security/transferPromotionApplyHandler.js) and [functions/security/transferPromotionRollbackHandler.js](functions/security/transferPromotionRollbackHandler.js). Keep stress validation and retry-policy review as follow-up hardening.
	Owner/Status: MITIGATED - core recovery controls delivered 2026-04-04; fixture-backed execution evidence pending
