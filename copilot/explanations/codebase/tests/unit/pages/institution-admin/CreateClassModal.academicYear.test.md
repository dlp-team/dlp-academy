<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.md -->
# CreateClassModal.academicYear.test.jsx

## Overview
- **Source file:** `tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx`
- **Last documented:** 2026-04-02
- **Role:** Ensures class-creation academic year is inherited from course and falls back predictably for legacy invalid values.

## Coverage
- Inherited year submission from selected course.
- Fallback year submission when selected course has invalid academic-year metadata.
- Student picker filtering by selected course when links exist.
- Legacy compatibility fallback when student-course links are not populated.

## Changelog
- 2026-04-03: Added student-course picker filtering/fallback test cases and stabilized fallback-year assertion against shared helper logic.
- 2026-04-02: Added modal tests for course-derived academic-year behavior.
