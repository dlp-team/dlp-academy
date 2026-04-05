<!-- copilot/explanations/codebase/tests/unit/pages/home/HomeSubjectModals.test.md -->
# HomeSubjectModals.test.jsx

## Overview
- **Source file:** `tests/unit/pages/home/HomeSubjectModals.test.jsx`
- **Last documented:** 2026-04-05
- **Role:** Regression suite for Home subject create/edit overlay close behavior.

## Coverage
- Backdrop close behavior for `SubjectModal` when no unsaved edits are pending.
- Backdrop close behavior for `EditSubjectModal` when no unsaved edits are pending.
- Unsaved-change confirmation path for `EditSubjectModal` when form values are modified before outside close.

## Changelog
### 2026-04-05
- Added deterministic confirmation-path assertions to cover dirty outside-close interception after shell unification.
