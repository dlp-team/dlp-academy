<!-- copilot/plans/todo/backend-zero-trust-security-hardening/phases/phase-04-storage-rules-hardening.md -->
# Phase 04 — Storage Rules Hardening

## Tasks
- Mirror Firestore auth model in `storage.rules` for institution and profile assets.
- Restrict write paths by role and tenant.
- Validate file path ownership assumptions.
- Ensure fallback deny for all unspecified paths.

## Outputs
- Hardened `storage.rules` with helper functions and strict path guards.
- Parity mapping between Storage paths and Firestore resources.
