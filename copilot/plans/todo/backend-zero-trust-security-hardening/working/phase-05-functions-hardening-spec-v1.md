<!-- copilot/plans/todo/backend-zero-trust-security-hardening/working/phase-05-functions-hardening-spec-v1.md -->
# Phase 05 Functions Hardening Specification v1

## Active Functions Inventory
- `validateInstitutionalAccessCode` (callable, public invoker)
- `getInstitutionalAccessCodePreview` (callable, authenticated)

## Current Security Observations
- `getInstitutionalAccessCodePreview` correctly checks auth and verifies role/tenant using `users` document.
- `validateInstitutionalAccessCode` is public by design; acceptable if response and data access remain minimal and non-sensitive.
- No unified guard module; checks are inline.

## Hardening Targets
1. Create centralized guard helpers in `functions/` for auth, role, tenant, and argument schema validation.
2. Add strict input validation and normalization for all callable inputs.
3. Ensure all privileged reads/writes verify tenant ownership server-side.
4. Add explicit structured error taxonomy (`invalid-argument`, `permission-denied`, `unauthenticated`, `failed-precondition`).
5. Add audit logs for sensitive accesses (preview generation, role-sensitive requests).

## Implementation Blueprint
- Add `functions/security/guards.js`:
  - `requireAuth(request)`
  - `requireRole(userData, roles[])`
  - `requireInstitutionScope(userData, institutionId)`
  - `assertString/assertPositiveNumber`
- Refactor existing callables to use guard functions.
- Add unit tests for guard module and callable deny/allow paths.

## Mandatory Tests to Add
- Preview endpoint denies unauthenticated.
- Preview endpoint denies wrong-institution institutionadmin.
- Preview endpoint allows global admin and same-tenant institutionadmin.
- Validation endpoint never leaks non-required institution metadata.

## Phase-05 Exit Evidence
- Guard module design approved.
- Function auth tests added and passing.
- Callable path risk review completed.

## Implemented in this phase
- Added centralized guard module: `functions/security/guards.js`.
- Refactored `functions/index.js` callables to use:
  - `assertNonEmptyString`
  - `assertPositiveNumber`
  - `requireAuthUid`
  - `requirePreviewPermission`
- Standardized input validation and permission checks while preserving existing callable behavior.

## Validation executed
- `functions/index.js` + `functions/security/guards.js` diagnostics → clean
- Full unit regression (`npm run test`) → pass
