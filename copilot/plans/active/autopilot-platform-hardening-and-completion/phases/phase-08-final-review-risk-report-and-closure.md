<!-- copilot/plans/active/autopilot-platform-hardening-and-completion/phases/phase-08-final-review-risk-report-and-closure.md -->
# Phase 08 - Final Review, Risk Report, and Closure

## Status
PLANNED

## Objective
Prepare closure-quality evidence and risk visibility before transitioning the plan to `inReview` and then `finished`.

## Planned Change Set
- Execute verification checklist under `reviewing/` and record evidence.
- Document residual risks, known tradeoffs, and mitigation recommendations.
- Ensure required explanation and temporal lossless artifacts are up to date.
- Assemble transition package for lifecycle move to `inReview`.

## Validation Gates
- Review checklist has all required items checked.
- Any failed checks include a review log with fix/re-test details.
- No unresolved lint/test regressions in touched scope.

## Rollback Triggers
- Critical checklist item fails without a validated fix.
- New defects discovered during review that affect released behavior.

## Completion Criteria
- Review artifacts are complete and evidence-backed.
- Plan is eligible for `inReview` transition with clear residual risk posture.
