<!-- copilot/plans/todo/backend-zero-trust-security-hardening/phases/phase-07-full-regression-validation.md -->
# Phase 07 — Full Regression Validation

## Objective
Ensure hardening changes did not break existing authorized behavior and that all protected paths still function correctly.

## Tasks
- Create missing regression tests for high-risk CRUD paths per role.
- Execute complete security tests (allow/deny/adversarial).
- Execute complete regression tests for normal authorized user flows.
- Validate create/read/update/delete behavior for all critical collections and storage paths.
- Validate cross-tenant isolation remains enforced while valid same-tenant operations still succeed.

## Exit criteria (mandatory)
- Zero failing tests.
- No unauthorized allow in security tests.
- No broken authorized flow in regression tests.
- Signed verification record attached to release checklist.