<!-- copilot/plans/todo/backend-zero-trust-security-hardening/phases/phase-03-firestore-rules-hardening.md -->
# Phase 03 — Firestore Rules Hardening

## Tasks
- Refactor rules to explicit helper functions for role, ownership, institution scope.
- Apply deny-by-default and explicit allow per collection.
- Enforce immutable identity/tenant fields on update.
- Disallow client-side writes to server-controlled fields.

## Outputs
- Hardened `firestore.rules` aligned with matrix.
- Collection-by-collection security comments and rationale.
