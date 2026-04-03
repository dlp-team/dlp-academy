<!-- copilot/plans/active/original-plan-autopilot-execution-2026-04-03/phases/phase-05-dashboard-pagination-planned.md -->
# Phase 05 - Dashboard Pagination Rollout

## Status
COMPLETED

## Objective
Add pagination to dashboards with potentially large lists (students, teachers, users, institutions, or similar) to reduce request/load pressure.

## Work Items
- Inventory all dashboard list views and identify current data-loading approach.
- Introduce shared pagination utility/hook where possible.
- Apply pagination consistently across applicable dashboards.
- Ensure filtering/search and pagination interoperate correctly.

## Preserved Behaviors
- Existing search/filter semantics remain unchanged.
- Existing permission-scoped datasets remain unchanged.

## Risks
- Inconsistent list APIs between dashboards.
- Pagination state reset on tab/context changes.

## Validation
- Manual pagination checks across all affected dashboards.
- `get_errors` for touched dashboards/hooks/utils.

## Exit Criteria
- All large-list dashboards have stable, consistent pagination behavior.

## Progress Notes
- Added backend pagination for global Admin institutions list using Firestore cursor pagination (`limit + startAfter`).
- Added reusable table pagination component and applied it across Teacher dashboard large list tables.
- Existing backend pagination in Admin users and Institution Admin users remains preserved.
- Added Institution Admin organization-list pagination in `CourseList` and `ClassList` using shared `TablePagination`.
- Reduced classes/courses mutation-time request volume by replacing post-write full refetch loops with local state synchronization in `useClassesCourses`.

## Completion Notes
- Pagination now covers all identified high-volume dashboard list surfaces in scope.
- Request-efficiency in Institution Admin organization workflows improved without changing deletion/restore semantics.
