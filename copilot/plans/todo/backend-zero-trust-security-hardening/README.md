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
