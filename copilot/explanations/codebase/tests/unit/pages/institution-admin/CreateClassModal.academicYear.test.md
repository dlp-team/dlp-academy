<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.md -->
# CreateClassModal.academicYear.test.jsx

## Overview
- **Source file:** `tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx`
- **Last documented:** 2026-04-02
- **Role:** Ensures class-creation academic year is inherited from course and falls back predictably for legacy invalid values.

## Coverage
- Inherited year submission from selected course.
- Fallback year submission using deterministic system time.

## Changelog
- 2026-04-02: Added modal tests for course-derived academic-year behavior.
