<!-- copilot/plans/todo/backend-zero-trust-security-hardening/phases/phase-05-functions-and-privileged-paths.md -->
# Phase 05 — Functions and Privileged Paths

## Tasks
- Audit callable/HTTP functions for auth + role checks.
- Enforce tenant scoping server-side even for privileged code.
- Add centralized authorization guards and structured error responses.
- Log sensitive operations for audit trail.
- Add validation for request payload schemas and reject malformed input.
- Prevent confused-deputy behavior by verifying resource ownership/tenancy server-side.
- Ensure all admin SDK operations are wrapped with explicit permission checks.
- Add rate-limit or abuse-resistant checks for sensitive operations where applicable.

## Outputs
- Hardened `functions/` auth guard layer.
- Privileged operation checklist and expected claims/role requirements.

## Mandatory tests
- Add unit tests for guard functions and role/tenant enforcement.
- Add integration-style tests for privileged endpoints (allowed + denied).

## Exit criteria
- No privileged function path lacks auth + role + tenant checks.
- Function authorization tests pass.
## Status
 - Partially completed (guards + unit tests implemented, broader hardening pending; reviewed 2026-03-12)

## Completed artifacts
 - `working/phase-05-functions-hardening-spec-v1.md`
 - `functions/security/guards.js`
 - `functions/security/previewHandler.js`
 - `tests/unit/functions/guards.test.js` (4/4 pass)
 - `tests/unit/functions/preview-handler.test.js` (6/6 pass)

## Evidence-based review result (2026-03-12)
- ✅ Centralized validation/authorization guards were added and are used by current callables.
- ✅ Guard unit tests pass.
- ✅ Privileged preview endpoint boundary tests (allow + deny) are implemented and passing.
- ⚠️ Sensitive-operation audit logging and abuse/rate-limit protections are not yet implemented in current function paths.

## Required continuation scope
- Add callable-level allow/deny tests for `getInstitutionalAccessCodePreview` and any privileged endpoint introduced later.
- Add structured audit logging for privileged preview/code operations.
- Evaluate and add abuse controls where endpoint sensitivity requires them.
