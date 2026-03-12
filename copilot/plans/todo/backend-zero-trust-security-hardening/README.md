<!-- copilot/plans/todo/backend-zero-trust-security-hardening/README.md -->
# Backend Zero-Trust Security Hardening

## Objective
Raise backend security posture to a maximum practical level by enforcing least-privilege access at every layer (Firestore Rules, Storage Rules, Auth claims/roles, server-side flows), while preserving multi-tenant isolation and operational continuity.

## Scope
- Firestore read/write permissions by role and ownership.
- Cross-institution isolation enforcement (`institutionId` boundaries).
- Storage path authorization consistency with Firestore permissions.
- Server-side privileged operations (Functions/admin SDK) with strict input authorization.
- Auditability, test coverage, staged rollout, and rollback safety.
- Mandatory creation and execution of tests for every hardened rule/path.
- Mandatory no-regression validation to ensure nothing breaks after hardening.

## Explicit security model
- Deny-by-default everywhere.
- Allow-by-exception with explicit role+resource checks.
- Never trust client claims unless verified by rules/server against persisted user role state.
- Every mutating path must validate both actor role and tenancy scope.

## Non-goals
- Production deployment in this plan document.
- “Perfect security” guarantees; objective is maximal practical risk reduction with measurable controls.

## Risks addressed
- Privilege escalation through broad rules.
- Tenant data leakage through weak `institutionId` checks.
- Write paths that bypass ownership constraints.
- Inconsistent Firestore vs Storage authorization.
- Admin-function misuse without strict guards.

## Deliverables
- Hardened rules matrix (Firestore + Storage).
- Rule tests for allowed/denied scenarios by role.
- Security review checklist and regression gates.
- Migration/runbook and rollback strategy.

## Definition of complete plan execution
- All phases completed in order with evidence artifacts per phase.
- All required tests created and executed (security + regression).
- No known unauthorized-allow path remains in rules or privileged backend logic.
- Rollout dry-run, staged release checklist, and rollback drill evidence produced.

## Success metrics
- 100% collection/path coverage in authorization matrix.
- 100% critical CRUD actions covered by allow/deny tests per role.
- 0 critical/high unresolved findings from security validation.
- 0 regressions in authorized workflows after hardening.

## Required evidence package
- Authorization matrix file and change log.
- Security test results (commands + pass/fail + timestamps).
- Regression test results (commands + pass/fail + timestamps).
- Release gate checklist signed with owner/date.
- Rollback drill result summary.

## Mandatory test policy
- Every change to rules or privileged backend code must include new/updated tests in the same phase.
- Tests are not optional: they must be executed locally and pass before phase completion.
- Security tests + regression tests must both pass before rollout.
- Any failing test blocks progression to the next phase until resolved.

## Execution rule
- This plan is executed as a single continuity workflow: no phase is considered done without artifacts + tests + verification updated in `reviewing/`.
