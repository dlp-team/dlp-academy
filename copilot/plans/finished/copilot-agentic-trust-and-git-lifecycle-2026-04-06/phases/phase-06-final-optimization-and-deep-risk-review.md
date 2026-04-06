<!-- copilot/plans/finished/copilot-agentic-trust-and-git-lifecycle-2026-04-06/phases/phase-06-final-optimization-and-deep-risk-review.md -->
# Phase 06 - Final Optimization and Deep Risk Review

## Status
COMPLETED

## Objective
Execute the mandatory final optimization phase and complete deep risk analysis before lifecycle transition.

## Optimization Checklist
- Centralize repeated guidance to reduce maintenance overhead.
- Split oversized operational docs where complexity requires modularization.
- Improve naming clarity and reading flow without behavior drift.
- Apply safe efficiency improvements validated by deterministic checks.
- Run lint and test gates for all touched implementation scope.

## Deep Risk Analysis Checklist
- Security and permission boundary risks.
- Data integrity and rollback safety risks.
- Runtime failure modes and degraded dependency risks.
- Unintended behavior under edge and stress scenarios.

## Exit Criteria
- Optimization evidence documented.
- Deep risk analysis file completed in `reviewing/`.
- Out-of-scope risks logged to `copilot/plans/out-of-scope-risk-log.md` if found.

## Validation
- `npm run lint`
- `npm run test`
- `npx tsc --noEmit`
- `get_errors` on all touched files

## Completion Notes
- Completed on 2026-04-06.
- Completed optimization pass:
	- Removed duplicated enforcement line in `.github/copilot-instructions.md`.
	- Synchronized stale plan path headers after lifecycle move.
	- Removed unsafe git revert examples from `copilot/autopilot/git-workflow-rules.md`.
- Validation completed:
	- `npm run lint` passed.
	- `npx tsc --noEmit` passed.
	- `npm run test` passed after stabilizing two timeout-prone tests in `tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`.
	- Deep risk analysis completed in `reviewing/deep-risk-analysis-2026-04-06.md`.



