<!-- copilot/plans/todo/backend-zero-trust-security-hardening/phases/phase-03-firestore-rules-hardening.md -->
# Phase 03 — Firestore Rules Hardening

## Tasks
- Refactor rules to explicit helper functions for role, ownership, institution scope.
- Apply deny-by-default and explicit allow per collection.
- Enforce immutable identity/tenant fields on update.
- Disallow client-side writes to server-controlled fields.
- Add collection-specific guards for subjects/folders/topics/resources/quizzes/invites/shortcuts.
- Ensure `institutionId` parity between request actor and target doc on create/update.
- Add explicit read constraints for shared documents by membership lists.
- Add strict validation for user/admin collections to prevent role tampering.

## Outputs
- Hardened `firestore.rules` aligned with matrix.
- Collection-by-collection security comments and rationale.

## Mandatory tests
- Create/update `tests/rules/` cases for each changed collection path.
- Execute `npm run test:rules` after each rules segment update.

## Exit criteria
- No broad allow clauses remain for protected collections.
- All changed collection tests pass.
## Status
 - Completed (Design/spec completion, 2026-03-12)
## Completed artifacts
 - `working/phase-03-firestore-hardening-spec-v1.md`
