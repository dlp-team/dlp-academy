<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.md -->
# CreateCourseModal.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx`
- **Last documented:** 2026-04-04
- **Role:** Course creation modal with composed course-name and canonical academic-year capture.

## Responsibilities
- Collects number/name and composes display `name`.
- Requires valid academic year and blocks submit on invalid format.
- Uses picker-backed input for deterministic year selection.
- Supports optional per-course period schedule overrides (period start/end + extraordinary end) aligned with institution periodization.
- Builds default per-period dates from institution calendar settings when course-level override is enabled.
- Submits normalized `coursePeriodSchedule` payload when override is active.

## Exports
- `default CreateCourseModal`

## Changelog
- 2026-04-05: Integrated shared overlay dirty-close interception by routing cancel/header-dismiss actions through the shell-level close guard and enabling unsaved-change confirmation.
- 2026-04-04: Added optional per-course period schedule section with baseline defaults derived from institution calendar + periodization mode.
- 2026-04-04: Added schedule validation feedback for incomplete/overlapping period ranges before submit.
- 2026-04-02: Added mandatory academic-year field with strict validation and picker integration.
