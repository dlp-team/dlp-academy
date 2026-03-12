<!-- copilot/plans/todo/backend-zero-trust-security-hardening/phases/phase-04-storage-rules-hardening.md -->
# Phase 04 — Storage Rules Hardening

## Tasks
- Mirror Firestore auth model in `storage.rules` for institution and profile assets.
- Restrict write paths by role and tenant.
- Validate file path ownership assumptions.
- Ensure fallback deny for all unspecified paths.
- Enforce MIME/size constraints where supported by policy.
- Ensure institution branding paths are writable only by institution admins or global admins.
- Ensure profile picture paths are writable only by owner user.
- Ensure read visibility matches product policy (public vs tenant-restricted assets).

## Outputs
- Hardened `storage.rules` with helper functions and strict path guards.
- Parity mapping between Storage paths and Firestore resources.

## Mandatory tests
- Add storage allow/deny tests for every active path class.
- Add negative tests for cross-tenant and impersonation writes.

## Exit criteria
- Storage rules are deny-by-default with explicit path allows only.
- Storage tests pass with no unauthorized allows.
## Status
 - Partially completed (rules implemented, test evidence incomplete; reviewed 2026-03-12)

## Completed artifacts
 - `working/phase-04-storage-hardening-spec-v1.md`
 - Hardened `storage.rules` with explicit path allows and global deny fallback.

## Evidence-based review result (2026-03-12)
- ✅ Deny-by-default fallback exists.
- ✅ Profile and institution-branding path guards are implemented.
- ⚠️ Mandatory storage allow/deny tests for every active path class are **not present** in `tests/rules/`.
- ⚠️ Cross-tenant/impersonation negative tests for Storage are **missing**.

## Required continuation scope
- Add dedicated Storage rule tests (owner, same-tenant institution admin, cross-tenant deny, non-owner deny, global-admin allow).
- Record execution evidence in `reviewing/test-execution-matrix.md`.
