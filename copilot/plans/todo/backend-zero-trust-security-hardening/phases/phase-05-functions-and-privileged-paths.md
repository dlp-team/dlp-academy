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
