<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/ClassDetail.studentCourseEligibility.test.md -->
# ClassDetail.studentCourseEligibility.test.jsx

## Overview
- **Source file:** `tests/unit/pages/institution-admin/ClassDetail.studentCourseEligibility.test.jsx`
- **Last documented:** 2026-04-03
- **Role:** Regression coverage for Phase 05 class-detail student assignment eligibility behavior.

## Coverage
- Confirms class-detail edit picker excludes new out-of-course candidates when course links are available.
- Confirms previously selected rows remain visible and can be saved while adding eligible students.
- Confirms legacy fallback shows full student list with compatibility messaging when no links exist.
- Confirms changing the class course prunes incompatible `studentIds` from the identifier-save payload.

## Changelog
- 2026-04-03: Added deterministic class-detail eligibility regression suite, including course-change student normalization coverage.
