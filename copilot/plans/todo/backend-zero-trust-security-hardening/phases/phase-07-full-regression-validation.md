<!-- copilot/plans/todo/backend-zero-trust-security-hardening/phases/phase-07-full-regression-validation.md -->
# Phase 07 — Full Regression Validation

## Status
- Partially completed (2026-03-12)

## Objective
Ensure hardening changes did not break existing authorized behavior and that all protected paths still function correctly.

## Tasks
- Create missing regression tests for high-risk CRUD paths per role.
- Execute complete security tests (allow/deny/adversarial).
- Execute complete regression tests for normal authorized user flows.
- Validate create/read/update/delete behavior for all critical collections and storage paths.
- Validate cross-tenant isolation remains enforced while valid same-tenant operations still succeed.
- Validate dashboard/admin/teacher/student primary workflows for authorization side-effects.
- Validate upload, invite, sharing, and ownership-transfer flows after hardening.
- Confirm no false-deny paths for legitimate institution-admin operations.

## Mandatory execution commands
- `npm run test:rules`
- `npm run test`
- `npm run lint`
- `npx tsc --noEmit`

## Exit criteria (mandatory)
- Zero failing tests.
- No unauthorized allow in security tests.
- No broken authorized flow in regression tests.
- Signed verification record attached to release checklist.
- Regression evidence recorded in `reviewing/test-execution-matrix.md`.

## Executed in this phase
- Re-ran full rules suite after phase-06 expansion: pass (13/13).
- Re-ran full unit suite including new functions guard tests: pass (45/45, 283/283).
- Re-ran lint after fixing `usePersistentState`: remaining failures are outside the hardening changes made in this request.
- Re-ran type gate: blocked because `typescript` is not installed in the workspace.

## Current blockers to full closure
- `npm run lint` still fails due existing repository backlog in unrelated files.
- `npx tsc --noEmit` cannot run until `typescript` is added to the workspace dev dependencies.