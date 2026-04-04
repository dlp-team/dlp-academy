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
	Why Out of Scope: Requires redesign to chunk snapshot persistence into subcollection documents plus backwards-compatible read logic.
	Recommended Follow-up: Implement chunked snapshot storage with deterministic chunk keys, integrity checksum, and read-time reassembly for rollback execution.
	Owner/Status: Phase 05 follow-up - pending

- Date: 2026-04-04
	Plan/Phase: [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md)
	Related Files: [functions/security/transferPromotionApplyHandler.js](functions/security/transferPromotionApplyHandler.js)
	Risk Summary: Chunked apply execution can partially commit when an error occurs mid-run, before final run/rollback status metadata is written, leaving non-atomic state transitions.
	Why Out of Scope: Requires resumable execution model and explicit staged state machine (`pending`, `applying`, `applied`, `failed`) with compensation semantics.
	Recommended Follow-up: Add pre-apply run marker, per-chunk checkpoint records, and deterministic retry/rollback orchestration to guarantee recoverability.
	Owner/Status: Phase 05 follow-up - pending
