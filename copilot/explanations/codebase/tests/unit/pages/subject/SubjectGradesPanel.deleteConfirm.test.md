<!-- copilot/explanations/codebase/tests/unit/pages/subject/SubjectGradesPanel.deleteConfirm.test.md -->
# SubjectGradesPanel.deleteConfirm.test.jsx

## Overview
- **Source file:** `tests/unit/pages/subject/SubjectGradesPanel.deleteConfirm.test.jsx`
- **Last documented:** 2026-03-30
- **Role:** Focused regression coverage for Subject grades extra-activity deletion confirmation behavior.

## Coverage
- Deletion intent opens an in-page confirmation modal instead of using browser `window.confirm(...)`.
- No Firestore delete batch is executed before explicit user confirmation.
- Confirm action deletes both the evaluation item and its related `subjectEvaluationGrades` docs.

## Changelog
### 2026-03-30
- Added initial page-component test suite for in-page confirmation-first deletion in `SubjectGradesPanel`.
- Added assertions that browser confirm is never invoked and destructive writes run only after modal confirmation.
