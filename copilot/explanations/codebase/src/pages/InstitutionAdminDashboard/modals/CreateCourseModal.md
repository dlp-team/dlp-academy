<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.md -->
# CreateCourseModal.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx`
- **Last documented:** 2026-04-02
- **Role:** Course creation modal with composed course-name and canonical academic-year capture.

## Responsibilities
- Collects number/name and composes display `name`.
- Requires valid academic year and blocks submit on invalid format.
- Uses picker-backed input for deterministic year selection.

## Exports
- `default CreateCourseModal`

## Changelog
- 2026-04-02: Added mandatory academic-year field with strict validation and picker integration.
