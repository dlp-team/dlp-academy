<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/studentCourseLinkUtils.test.md -->
# studentCourseLinkUtils.test.js

## Overview
- **Source file:** `tests/unit/pages/institution-admin/studentCourseLinkUtils.test.js`
- **Last documented:** 2026-04-03
- **Role:** Deterministic unit coverage for Phase 05 student-course eligibility resolution.

## Coverage
- Merges student profile links and class-derived links into a single unique course ID set.
- Filters eligible students by selected course when links are present.
- Keeps legacy fallback behavior when no student-course links are populated.
- Resolves eligibility through class membership links even when profile fields are empty.

## Changelog
- 2026-04-03: Added new utility test suite for course-constrained class assignment logic.
