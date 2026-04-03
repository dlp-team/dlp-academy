<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/ClassList.md -->
# ClassList.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/classes-courses/ClassList.tsx`
- **Last documented:** 2026-04-03
- **Role:** Table renderer for institution classes with row navigation, quick actions, and paginated browsing.

## Responsibilities
- Displays class rows with linked course, teacher, and student-count metadata.
- Delegates select/edit/delete actions through parent handlers.
- Preserves table empty-state messaging when there are no classes.
- Applies client-side pagination to keep large class tables performant and scannable.

## Exports
- `default ClassList`

## Main Dependencies
- `react`
- `lucide-react`
- `../../../../components/ui/TablePagination`

## Changelog
- 2026-04-03: Added client-side pagination using shared `TablePagination` (`15` items per page) without changing row-level edit/delete interactions.
