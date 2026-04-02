<!-- copilot/plans/inReview/shortcut-move-request-workflow-enablement/phases/phase-03-rules-and-test-hardening.md -->
# Phase 03 - Rules and Test Hardening

## Status
- COMPLETED

## Objective
Secure `shortcutMoveRequests` data access and verify deterministic behavior via unit/rules tests.

## Deliverables
- `firestore.rules`: scoped access for `shortcutMoveRequests`.
- `tests/rules/firestore.rules.test.js`: requester/owner/admin allow/deny tests.
- `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`: callable integration behavior tests.
- `tests/unit/components/NotificationsPanel.test.jsx` (or equivalent): owner resolution action behavior.

## Validation Gate
- Requester and target owner can read; unrelated users denied.
- Status write permissions match least-privilege constraints.
- All new tests pass consistently.

