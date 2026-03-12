<!-- copilot/plans/todo/backend-zero-trust-security-hardening/working/phase-03-firestore-hardening-spec-v1.md -->
# Phase 03 Firestore Hardening Specification v1

## Current-State Findings
- Rules are extensive and partly tenant-aware.
- `users` rules are too broad for role/institution mutation scenarios.
- `institutions` block includes broad `get/read` and duplicated update semantics that should be tightened.
- Mixed logic in shortcuts/sharing requires strict anti-impersonation assertions.

## Hardening Targets
1. Enforce immutable-sensitive fields for `users` unless global admin.
2. Split `institutions` permissions by action and actor with no duplicate broad clauses.
3. Apply strict allowlist updates for institutional policy fields.
4. Ensure every create/update path validates `institutionId` parity and prevents cross-tenant object mutation.
5. Validate ownership transitions (owner transfer) via explicit checks.

## Rule Refactor Plan
- Centralize helper groups:
  - auth context (`isSignedIn`, role resolution)
  - tenancy (`sameInstitution`, tenant constraints)
  - ownership/share (`isOwner`, `isSharedEditor`)
  - mutation constraints (`immutableFieldsUnchanged`)
- Replace any permissive fallback with explicit `false` default.

## Collection-Level Security Actions
- `users`: self-profile updates only for safe fields; admin-only role/institution writes.
- `institutions`: institutionadmin update only own institution and only allowed fields.
- `institution_invites`: hard tenant/role checks on list/create/delete.
- `subjects|folders|topics|documents|resumen|quizzes|exams|shortcuts`: standardize owner+tenant checks and immutable tenant fields.

## Test Cases to Add
- Deny student/teacher `users.role` changes.
- Deny institutionadmin cross-tenant `institutions/{id}` updates.
- Deny cross-tenant shortcut create/update.
- Deny subject write when request tenant differs from resource tenant.

## Phase-03 Exit Evidence
- Updated rules draft.
- Added/updated rule tests.
- `npm run test:rules` pass for changed paths.

## Implemented in this phase
- Hardened `users` rule block in `firestore.rules` by splitting `create/update/delete`.
- Prevented self role and institution escalation by requiring self-updates to keep `role` and `institutionId` unchanged.
- Preserved global admin full control and institution admin scoped management (with anti-admin-promotion guard).

## Validation executed
- `npm run test:rules` → pass
- `npm run test` → pass
