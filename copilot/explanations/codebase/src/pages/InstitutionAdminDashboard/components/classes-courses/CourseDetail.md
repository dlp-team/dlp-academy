<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/CourseDetail.md -->
# CourseDetail.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/classes-courses/CourseDetail.tsx`
- **Last documented:** 2026-04-02
- **Role:** Detail view/editor for a course, including canonical academic-year ownership.

## Responsibilities
- Displays per-course metrics and related classes.
- Supports inline editing for name, academic year, description, and color.
- Validates academic year format (`YYYY-YYYY`, consecutive years) before save.
- Surfaces canonical year in header/stats and passes updates through hook layer.

## Exports
- `default CourseDetail`

## Changelog
- 2026-04-02: Added editable canonical academic-year field with strict validation and picker UI.
- 2026-04-02: Updated header/stats to include course academic year.
