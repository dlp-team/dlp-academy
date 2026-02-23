# Phase 05: Multi-Tenant Scope (Planned)

## Goal

Ensure shortcuts/shares/rules remain correct under institution or tenant boundaries.

## Planned Work

- Define authoritative tenant field usage (`institutionId` behavior across subjects/folders/shortcuts).
- Ensure all schema/query paths include `institutionId` constraints.
- Enforce tenant-aware reads/writes in rules where required.
- Validate cross-tenant denial scenarios for share, shortcut queries, and shortcut creation.
- Define fallback behavior for records missing `institutionId` during migration window.

## Acceptance Criteria

- Every read selector used in Home/Subject/Topic scopes respects `institutionId`.
- Every write path stamps `institutionId` consistently.
- Cross-tenant access attempts are denied in both client behavior and Firestore rules.

## Dependencies

- Phase 07 rules hardening.
- Data consistency inputs from Phase 06 migration planning.
