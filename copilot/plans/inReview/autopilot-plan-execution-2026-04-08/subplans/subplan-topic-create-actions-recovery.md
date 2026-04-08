<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/subplans/subplan-topic-create-actions-recovery.md -->
# Subplan: Topic Create Actions Recovery

## Objective
Recover missing create actions on topic page by comparing current state with prior main-branch baseline behavior.

## Requested Outcomes
- Restore create buttons/menus for quizzes, exams, and study guides.
- Preserve current permissions and role constraints.
- Match prior UX behavior where still valid.

## Candidate Target Files
- `src/pages/Topic/**`
- `src/components/modules/**` related creation controls
- `src/utils/permissionUtils.js`

## Risks
- Reintroducing removed behavior without current permission gates.
- Colliding with recent refactors in topic tab routing/state.

## Validation
- Baseline diff check against main branch for affected symbols.
- Role-based visibility and action tests.
- `get_errors` + targeted topic unit/integration tests.
