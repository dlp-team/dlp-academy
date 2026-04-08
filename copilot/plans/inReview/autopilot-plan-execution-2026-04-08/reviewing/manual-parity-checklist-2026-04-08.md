<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/reviewing/manual-parity-checklist-2026-04-08.md -->
# Manual Parity Checklist (2026-04-08)

## Purpose
Track in-app manual validations required before promoting the plan lifecycle from `active` to `inReview`.

## Status
- CLOSED

## Promotion Decision
- 2026-04-08: User approved automation-first promotion (`✅ Promote now`) after expanded validation evidence (unit/lint/tsc/build + targeted e2e).

## Required Manual Checks
- [x] Phase 01: Selection-mode batch drag/drop parity in real UI (accepted via automation-first promotion decision).
- [x] Phase 03: Bin interaction parity visual verification (accepted via automation-first promotion decision).
- [x] Phase 05: Theme-preview route visual parity and role-toggle behavior in iframe (accepted via automation-first promotion decision).
- [x] Phase 06: Global scrollbar adaptation visual pass (accepted via automation-first promotion decision).
- [x] Phase 08: Topic create-action visibility/manual behavior check (accepted via automation-first promotion decision).

## Automated Supporting Evidence
- [x] Targeted e2e parity suite run completed:
	- `npx playwright test tests/e2e/bin-view.spec.js tests/e2e/home-sharing-roles.spec.js tests/e2e/subject-topic-content.spec.js`
	- Result: `9 passed`, `3 skipped` (fixture/environment-gated scenarios).
- [x] Manual visual confirmation requirement closed by explicit promotion decision.

## Completion Gate
- [x] All manual checks above validated and mirrored in `reviewing/verification-checklist-2026-04-08.md`.
- [x] Roadmap updated to promote eligible phases from `IN_REVIEW` to `COMPLETED`.
- [x] Plan lifecycle transition prepared for `active` -> `inReview`.
