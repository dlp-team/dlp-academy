<!-- copilot/explanations/codebase/src/utils/courseLabelUtils.md -->
# courseLabelUtils.ts

## Overview
- Source file: `src/utils/courseLabelUtils.ts`
- Last documented: 2026-04-03
- Role: Shared formatter for displaying course names with optional academic-year context.

## Responsibilities
- Normalize course display labels into a single reusable format.
- Return `Nombre (AAAA-AAAA)` when academic year exists.
- Provide safe fallback labels for legacy/empty course records.

## Exports
- `getCourseDisplayLabelFromValues(courseName, academicYear)`
- `getCourseDisplayLabel(course)`

## Main Dependencies
- `./academicYearLifecycleUtils`

## Changelog
- 2026-04-03: Added utility to centralize course-label disambiguation across subject and institution-admin selectors.
