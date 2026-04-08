<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/phases/phase-08-topic-create-actions-regression-recovery.md -->
# Phase 08 - Topic Create Actions Regression Recovery

## Status
- IN_REVIEW

## Objective
Restore missing topic create controls for quizzes, exams, and study guides using prior main behavior as baseline.

## Scope
- Compare current topic create flow against main branch baseline.
- Reintroduce missing UI triggers and handlers.
- Preserve existing permission guards and data constraints.

## Validation
- Baseline behavior parity checks.
- Role and permission checks.
- `get_errors` + targeted topic tests.

## Implementation Update (2026-04-08)
- Compared `Topic`, `TopicTabs`, and `useTopicLogic` create-control gating against `origin/main` baseline.
- Recovered create-action visibility by prioritizing explicit `user.role` before fallback role resolution in Topic module surfaces.
- Preserved existing preview mode read-only behavior and `permissions.canEdit` gating.
- Added regression coverage for explicit teacher-role precedence in:
	- `tests/unit/pages/topic/TopicTabs.createActions.test.jsx`
	- `tests/unit/hooks/useTopicLogic.test.js`

## Validation Evidence (2026-04-08)
- `get_errors` on touched Topic files and tests -> PASS.
- `npm run test -- tests/unit/pages/topic/TopicTabs.createActions.test.jsx tests/unit/hooks/useTopicLogic.test.js` -> PASS.
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> PASS.
