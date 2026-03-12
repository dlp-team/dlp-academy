<!-- copilot/plans/todo/backend-zero-trust-security-hardening/phases/phase-02-authorization-matrix.md -->
# Phase 02 — Authorization Matrix

## Tasks
- Define CRUD permissions per resource and role.
- Define ownership rules (`ownerId`, `createdBy`) and shared access semantics.
- Define strict institution constraints (`request.resource.data.institutionId` and immutable checks).
- Define prohibited transitions (e.g., role elevation writes from non-admin actors).

## Outputs
- Canonical authorization matrix used by both Firestore and Storage rules.
- Constraint list for immutable and server-only fields.
