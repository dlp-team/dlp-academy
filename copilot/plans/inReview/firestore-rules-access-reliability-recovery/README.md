# Firestore Rules Access Reliability Recovery

## Problem Statement
Users are reporting authorization regressions in core Home workflows after recent `firestore.rules` changes, including:
- drag-and-drop moves failing intermittently,
- deletes being denied inconsistently,
- broader permission friction in standard role-based flows.

## Objective
Recover stable, least-privilege behavior for Home and related flows by identifying exact failing operations, correcting rules surgically, and validating with emulator-backed and real e2e scenarios.

## Scope
- `firestore.rules` and rule-related test harnesses.
- Home operations impacted by rules: read, move, delete, share/unshare, shortcut sync behavior.
- E2E + rule validations for admin/institution-admin/teacher/student paths.

## Non-Goals
- UI redesign unrelated to authorization.
- Schema migrations unrelated to access checks.
- Deploying rules from agent environment.

## Status
- Lifecycle: `inReview`
- Current phase: COMPLETED (Phase 05 - Review Gate, Rollback, and Closure)

## Assumptions
- Failures are primarily rule-evaluation mismatches, not frontend business logic regressions.
- Existing e2e suite can be extended to cover observed failures.
- Local emulator/rules tests are available for fast iteration.

## Deliverables
1. Failure matrix with operation-level evidence (action, actor role, target doc path, expected vs actual).
2. Minimal `firestore.rules` patch set that restores intended behavior.
3. Updated tests:
   - rules/unit-style authorization checks,
   - e2e flows that reproduce and verify fixes.
4. Lossless report with before/after behavior and residual risks.

## Progress Update (2026-03-13)
- Phase 01 reproduction unblocked after correcting editor credentials in `.env`.
- Previously failing e2e suites now pass for editor-role login and route guard journeys.
- Added rules hardening for `institution_invites` delete email-field safety checks.
- Added rules regression test for invite delete when `email` field is missing.

## Exit Criteria
- Reproduced failures are eliminated.
- No regressions in unaffected role/resource operations.
- Targeted and full e2e suites pass.
- Security posture preserved (no role over-permissioning).