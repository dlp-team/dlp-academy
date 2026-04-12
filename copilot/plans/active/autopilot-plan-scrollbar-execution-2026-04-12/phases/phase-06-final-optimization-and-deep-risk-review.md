<!-- copilot/plans/active/autopilot-plan-scrollbar-execution-2026-04-12/phases/phase-06-final-optimization-and-deep-risk-review.md -->
# Phase 06 - Final Optimization and Deep Risk Review

## Objective
Close the plan with optimization, cleanup, and documented risk review before lifecycle transition.

## Scope
- Centralize duplicated logic discovered during implementation.
- Split oversized files when complexity exceeds maintenance threshold.
- Remove stale comments, dead branches, and incidental technical drift.
- Execute deep risk analysis and out-of-scope risk logging.

## Acceptance Criteria
- No regressions in touched behavior.
- Review artifacts are complete and aligned with implementation.

## Validation
- `npm run lint`
- `npx tsc --noEmit`
- `npm run test`
- `npm run build`
- Update `reviewing/verification-checklist-2026-04-12.md` and `reviewing/deep-risk-analysis-2026-04-12.md`.