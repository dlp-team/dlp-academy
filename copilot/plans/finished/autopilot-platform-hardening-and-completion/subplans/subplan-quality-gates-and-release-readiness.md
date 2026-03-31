<!-- copilot/plans/finished/autopilot-platform-hardening-and-completion/subplans/subplan-quality-gates-and-release-readiness.md -->
# Subplan - Quality Gates and Release Readiness

## Related Main Phase
- Phase 08 - Final Review, Risk Report, and Closure

## Objective
Create closure-quality confidence package before lifecycle transition to `inReview`.

## Scope
- Verification checklist completion with evidence.
- Residual risk and mitigation report.
- Documentation synchronization (lossless + explanation updates).

## Execution Slices
1. Execute all required validations for touched scope.
2. Record checklist evidence and create review log for any failed check.
3. Produce residual-risk summary with owner and mitigation path.
4. Prepare lifecycle transition package for `inReview`.

## Validation and Test Strategy
- Required commands:
  - `npm run lint`
  - `npm run test`
- Additional checks:
  - confirm no unresolved diagnostics in touched files,
  - verify plan-phase status consistency across roadmap and phase files.

## Rollback Strategy
- If closure checks fail, return plan to active execution and isolate unresolved blockers.
- Keep unresolved items explicitly marked with risk severity and owner.

## Completion Criteria
- Checklist is fully completed or has documented exceptions with remediation status.
- Residual risk report is actionable and transparent.
- Plan is ready for clean `inReview` transition.
