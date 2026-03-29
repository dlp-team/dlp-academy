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
 - Partially completed (implementation + validation subset, reviewed 2026-03-12)

## Completed artifacts
 - `working/phase-03-firestore-hardening-spec-v1.md`
 - `firestore.rules` hardening on `users` anti-escalation constraints.
 - `tests/rules/firestore.rules.test.js` expanded to 13/13 passing scenarios.

## Evidence-based review result (2026-03-12)
- ✅ User role/institution tampering guards are implemented and tested.
- ✅ Rules test gate passes (`npm run test:rules`).
- ⚠️ Exit criterion "No broad allow clauses remain for protected collections" is **not yet fully met** (multiple collection blocks still include broad role/owner allows and mixed legacy semantics).
- ⚠️ Collection-by-collection comments/rationale are incomplete for all protected paths.

## Required continuation scope
- Perform collection-by-collection tightening aligned to matrix for all protected paths, not only users/invites.
- Add targeted allow/deny tests per changed collection segment and re-run `npm run test:rules` after each segment.
