<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/reviewing/manual-parity-checklist-2026-04-08.md -->
# Manual Parity Checklist (2026-04-08)

## Purpose
Track in-app manual validations required before promoting the plan lifecycle from `active` to `inReview`.

## Status
- OPEN

## Required Manual Checks
- [ ] Phase 01: Selection-mode batch drag/drop parity in real UI (grid + list + root/breadcrumb drop targets).
- [ ] Phase 03: Bin interaction parity visual verification (grid/list press states, no-delay options reveal, read-only navigation from `Ver contenido`).
- [ ] Phase 05: Theme-preview route visual parity and role-toggle behavior in iframe (`teacher`/`student`) during unsaved color changes.
- [ ] Phase 06: Global scrollbar adaptation visual pass at desktop/mobile breakpoints in light and dark modes.
- [ ] Phase 08: Topic create-action visibility/manual behavior check across owner/editor and mixed-role contexts.

## Automated Supporting Evidence
- [x] Targeted e2e parity suite run completed:
	- `npx playwright test tests/e2e/bin-view.spec.js tests/e2e/home-sharing-roles.spec.js tests/e2e/subject-topic-content.spec.js`
	- Result: `9 passed`, `3 skipped` (fixture/environment-gated scenarios).
- [ ] Manual visual confirmation still required for final promotion.

## Completion Gate
- [ ] All manual checks above validated and mirrored in `reviewing/verification-checklist-2026-04-08.md`.
- [ ] Roadmap updated to promote eligible phases from `IN_REVIEW` to `COMPLETED`.
- [ ] Plan lifecycle transition prepared for `active` -> `inReview`.
