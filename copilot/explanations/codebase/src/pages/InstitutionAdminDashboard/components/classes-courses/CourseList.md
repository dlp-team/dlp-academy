<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/CourseList.md -->
# CourseList.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/classes-courses/CourseList.tsx`
- **Last documented:** 2026-04-03
- **Role:** Grid renderer for courses with delete affordance, detail navigation, and paginated browsing.

## Responsibilities
- Renders course cards with color accent and class-count summary.
- Delegates delete and select actions through parent-provided handlers.
- Handles empty-state rendering for institutions without courses.
- Applies client-side pagination to keep large course grids manageable.

## Exports
- `default CourseList`

## Main Dependencies
- `react`
- `lucide-react`
- `../../../../components/ui/TablePagination`
- `../../../../utils/courseLabelUtils`

## Changelog
- 2026-04-03: Updated course card titles to shared `Nombre (AAAA-AAAA)` formatting to disambiguate duplicate names across academic years.
- 2026-04-03: Added client-side pagination using shared `TablePagination` (`12` items per page) while preserving existing card actions and empty-state behavior.
