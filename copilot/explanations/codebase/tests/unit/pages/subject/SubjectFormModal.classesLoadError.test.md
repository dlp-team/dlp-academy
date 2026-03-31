<!-- copilot/explanations/codebase/tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.md -->
# SubjectFormModal.classesLoadError.test.jsx

## Overview
- **Source file:** `tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx`
- **Last documented:** 2026-03-31
- **Role:** Focused regression coverage for classes-tab load feedback determinism in `SubjectFormModal`.

## Coverage
- Verifies classes-tab renders class rows when classes query succeeds.
- Verifies classes-query permission failures render explicit inline feedback.
- Verifies classes empty-state remains deterministic after classes-load failure.

## Changelog
### 2026-03-31
- Added initial regression suite for `SubjectFormModal` classes-load success/error reliability behavior.
