<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md -->
# Strategy Roadmap

## Phase Sequence and Status
1. COMPLETED - Audits, source normalization, and dependency mapping.
2. COMPLETED - Institution settings domain model and calendar foundation.
3. COMPLETED - Courses/classes academic-year UX and linkage hardening.
4. IN_PROGRESS - Subject period metadata and lifecycle automation.
5. PLANNED - Student-course linking, transfer/promote architecture, and enrollment flow hardening.
6. PLANNED - Notifications behavior fixes, dedicated page, TTL, and email sync.
7. PLANNED - Institution customization preview full-screen fix and parity improvements.
8. PLANNED - Bin selection mode parity, visual dimming, and urgency sort labels.
9. PLANNED - Validation hardening, docs sync, review gate, and lifecycle transition.

## Dependency Rationale
- Phase 01 precedes all implementation-heavy work to avoid rework in schema/UX decisions.
- Settings and lifecycle policy model (Phase 02) must be established before subject automation (Phase 04).
- Courses/classes linkage updates (Phase 03) are prerequisites for class filtering and student assignment constraints.
- Student-course linking and transfer logic (Phase 05) depends on finalized academic-year model.
- Notification/page and preview changes are feature-isolated and can proceed after domain model stabilization.
- Final validation and docs sync remain explicit to prevent lifecycle drift.

## Immediate Next Actions
- Capture Phase 04 exit evidence for the completed non-Home lifecycle enforcement sweep (content viewers/editors and quiz edit route).
- Keep ongoing watch for newly added subject direct-entry routes to ensure they reuse `canUserAccessSubject(...)`.
- Transition Phase 04 to `inReview` when the team confirms current lint-warning baseline acceptance for closure gating.

## Validation Gates
- Per change set: `get_errors` on touched files.
- Per major feature block: targeted tests first, then impacted suites.
- Before `inReview`: `npm run lint`, `npx tsc --noEmit`, `npm run test`.
- Before `finished`: reviewing checklist fully checked with evidence.

## Rollback Strategy
- Keep each phase in isolated logical commits.
- Avoid mixing schema and UI transformations in the same commit.
- Preserve reversible changes for risky flows (subject lifecycle and enrollment transfer).
- If a phase introduces regression risk, halt phase progression and fix within the same phase before continuation.

## Risks and Controls
- Risk: lifecycle automation may hide active subjects incorrectly for some roles.
  - Control: role-aware decision matrix and deterministic test cases.
- Risk: course transfer workflow may duplicate or orphan student links.
  - Control: idempotent transfer job design plus dry-run preview.
- Risk: notifications TTL may remove records still needed by users.
  - Control: type-based retention policy with soft-delete window first.
