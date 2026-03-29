<!-- copilot/plans/todo/backend-zero-trust-security-hardening/phases/phase-02-authorization-matrix.md -->
# Phase 02 — Authorization Matrix

## Tasks
- Define CRUD permissions per resource and role.
- Define ownership rules (`ownerId`, `createdBy`) and shared access semantics.
- Define strict institution constraints (`request.resource.data.institutionId` and immutable checks).
- Define prohibited transitions (e.g., role elevation writes from non-admin actors).
- Define server-only fields for each resource and enforce write restrictions.
- Define field-level mutation constraints for sensitive docs.
- Define explicit read restrictions for shared vs private records.
- Define exception handling for admin break-glass flows.

## Outputs
- Canonical authorization matrix used by both Firestore and Storage rules.
- Constraint list for immutable and server-only fields.

## Mandatory tests
- Generate matrix-driven test cases (allow + deny) for each critical collection.
- Validate matrix-test parity (every matrix row has at least one test).

## Exit criteria
- Authorization matrix is complete and unambiguous.
- Matrix coverage tests pass.
## Status
 - Completed (2026-03-12)
## Completed artifacts
 - `working/phase-02-authorization-matrix-v1.md`
