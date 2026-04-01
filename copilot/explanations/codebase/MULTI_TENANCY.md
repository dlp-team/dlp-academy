# MULTI_TENANCY

## Tenant Model
DLP Academy is institution-scoped. The primary tenant key is `institutionId`.

## Isolation Rules
1. Read Isolation
- Authenticated users can read resources only when one of these is true:
  - global admin privilege,
  - same `institutionId`,
  - legacy owner-only fallback for records without `institutionId`.

2. Write Isolation
- Non-admin write operations must respect tenant match and role constraints.
- Missing or mismatched `institutionId` on scoped resources is denied by rules.

3. Cross-Resource Validation
- Rules resolve parent references (`subjectId`, `topicId`) to ensure downstream records remain tenant-compatible.

## Role Scope in Tenant Context
- `admin`: global access across institutions.
- `institutionadmin`: institution-bounded management.
- `teacher`: instruction and content authoring in institution scope.
- `student`: read/join paths constrained by sharing, class, and enrolled vectors.

## Application-Level Guardrails
1. Frontend
- Hooks and utilities carry current user context and institution ID when building writes.
- Admin surfaces filter and mutate institution-scoped records explicitly.

2. Rules
- `currentUserInstitutionId()` is the canonical policy anchor.
- Helper functions (`sameInstitution`, `canReadResource`, `canWriteResource`) centralize tenancy checks.

3. Testing
- Rules tests verify deny paths for tenant mismatches and least-privilege behavior.
- Unit/page tests protect role and pagination workflows around tenant-scoped data.

## Safe Change Checklist
Before changing data access paths:
1. Preserve `institutionId` propagation in payload builders.
2. Validate rules deny-paths (mismatch/missing tenant IDs).
3. Re-run affected rules and page-level tests.
4. Update plan/docs and lossless artifacts.

## Changelog
- 2026-04-01: Created initial multi-tenancy reference for Phase 08 documentation scope.
