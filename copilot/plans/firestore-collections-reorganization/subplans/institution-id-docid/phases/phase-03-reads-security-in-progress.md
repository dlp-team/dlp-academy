# Phase 03 - Reads, Filters, and Security (Completed)

## Objective
Enforce tenant isolation in reads and security rules using `institutionId` (institution doc ID).

## Scope
- Query filters in hooks and dashboards
- Security rules and validation
- UI assumptions about institution-scoped data

## Actions Completed
- Teacher dashboard reads updated to use `institutionId`.
- Institutions rules use document path id for update authorization.
- Enforced institution scoping in rules for users, subjects, folders, shortcuts, classes, courses, and allowed_teachers.

## Remaining Work
- None for Phase 03. Validate in staging after backfill.

## Notes
- Current rules are permissive for most collections; tightening will require coordinated testing.
