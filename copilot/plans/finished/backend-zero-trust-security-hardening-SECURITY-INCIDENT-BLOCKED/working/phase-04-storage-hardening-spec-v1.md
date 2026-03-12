<!-- copilot/plans/todo/backend-zero-trust-security-hardening/working/phase-04-storage-hardening-spec-v1.md -->
# Phase 04 Storage Hardening Specification v1

## Current-State Findings
- Active upload paths:
  - `profile-pictures/{userId}`
  - `institutions/{institutionId}/branding/icon.*`
  - `institutions/{institutionId}/branding/logo.*`
- Current `storage.rules` includes Firestore-style helpers not required for storage and is structurally over-complex for active path set.

## Hardening Targets
1. Deny-by-default baseline for all storage paths.
2. Profile pictures: owner-only write, signed-in read policy per product requirement.
3. Institution branding: only institutionadmin of same tenant or global admin can write.
4. Require tenant identity from authoritative source (prefer user doc lookup parity with Firestore role model).
5. Add file constraints (size/type) where policy requires.

## Proposed Storage Rule Layout
- Minimal helper set:
  - `isSignedIn()`
  - `currentUserPath()` / `hasCurrentUserDoc()`
  - `currentUserRole()` / `currentUserInstitutionId()`
  - `isGlobalAdmin()` / `isInstitutionAdminOf(institutionId)`
- Path rules:
  - `/profile-pictures/{userId}`
  - `/institutions/{institutionId}/branding/{fileName}`
  - `match /{allPaths=**}` deny fallback

## Mandatory Tests to Add
- Allow owner profile upload/read.
- Deny non-owner profile upload.
- Allow institutionadmin branding upload in same institution.
- Deny institutionadmin branding upload for other institution.
- Allow global admin branding upload/read.

## Phase-04 Exit Evidence
- Revised `storage.rules` draft with simplified helpers.
- Storage allow/deny test matrix and results.

## Implemented in this phase
- Replaced `storage.rules` with a clean deny-by-default model aligned to active paths.
- Added helper-driven authorization using Firestore `users/{uid}` role/institution context.
- Enforced:
  - owner/global-admin access for `profile-pictures/{userId}`
  - institutionadmin-of-tenant/global-admin write access for branding paths
  - explicit fallback deny for all unspecified paths.

## Validation executed
- Rules syntax/diagnostics check via editor errors → clean
- Regression checks:
  - `npm run test:rules` → pass
  - `npm run test` → pass
