<!-- copilot/explanations/codebase/tests/unit/pages/subject/SubjectGradesPanel.snapshotError.test.md -->
# SubjectGradesPanel.snapshotError.test.jsx

## Overview
- **Source file:** `tests/unit/pages/subject/SubjectGradesPanel.snapshotError.test.jsx`
- **Last documented:** 2026-03-30
- **Role:** Focused regression suite for SubjectGradesPanel realtime listener feedback behavior.

## Coverage
- Verifies no realtime feedback banner appears when all snapshot listeners succeed.
- Verifies evaluation-items listener failure surfaces inline fallback feedback.
- Verifies listener error logging path is executed on failure.

## Changelog
### 2026-03-30
- Added initial regression suite for SubjectGradesPanel snapshot listener success/failure feedback behavior.
