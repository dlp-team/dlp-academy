# Phase 03 - Reads, Filters, and Security (In Progress)

## Objective
Enforce tenant isolation in reads and security rules using `institutionId` (institution doc ID).

## Scope
- Query filters in hooks and dashboards
- Security rules and validation
- UI assumptions about institution-scoped data

## Actions Completed
- Teacher dashboard reads updated to use `institutionId`.
- Institutions rules use document path id for update authorization.

## Remaining Work
- Audit remaining reads for legacy `schoolId` usage.
- Align security rules for subjects, folders, shortcuts, classes, courses, and users to enforce tenant boundaries.
- Ensure share flows and shortcuts validate institution boundaries.

## Notes
- Current rules are permissive for most collections; tightening will require coordinated testing.
