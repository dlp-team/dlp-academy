<!-- copilot/plans/todo/backend-zero-trust-security-hardening/working/phase-01-threat-model.md -->
# Phase 01 Threat Model

## Actors
- Anonymous
- Student
- Teacher
- Institution Admin
- Global Admin

## Primary Threat Scenarios
1. Cross-tenant data read/write via weak `institutionId` checks.
2. Role escalation by writing `users.role` or privileged institution policy fields.
3. Shared-resource abuse (shortcut/share paths) to access unauthorized targets.
4. Unauthorized storage writes (branding/logo/icon/profile) via path spoofing.
5. Callable function misuse without strict auth/tenant validation.
6. Insecure defaults (`allow read` broad clauses, public document access) leaking private metadata.

## Per-Boundary Risks
- Client → Firestore: direct write attempts to server-only fields.
- Client → Storage: forged paths and content-type misuse.
- Client → Callable Functions: abuse via unauthenticated or wrong-institution requests.
- Rules logic: inconsistent role source (`token` vs `users` doc) can create bypass patterns.

## Top Priority Abuse Paths (P1)
- `users/{uid}` write rules and role/institution mutation.
- `institution_invites` list/create/delete paths.
- `shortcuts` create/read/update with owner/target cross-checks.
- `institutions/*/branding/*` storage uploads.
- Callable preview endpoint for access code generation.

## Required Mitigations in phases 02–05
- Deny-by-default with explicit allow per path/action.
- Immutable identity/tenant fields.
- Ownership + tenancy dual checks for all mutating operations.
- Test-enforced deny cases for each P1 abuse path.
