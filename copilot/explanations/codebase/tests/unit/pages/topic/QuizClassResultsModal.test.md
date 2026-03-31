<!-- copilot/explanations/codebase/tests/unit/pages/topic/QuizClassResultsModal.test.md -->
# QuizClassResultsModal.test.jsx

## Overview
- **Source file:** `tests/unit/pages/topic/QuizClassResultsModal.test.jsx`
- **Last documented:** 2026-03-31
- **Role:** Unit coverage for teacher-visible latest-attempt feedback behavior in QuizClassResultsModal.

## Coverage
- Permission-denied latest-attempt query errors render explicit inline access feedback.
- Successful empty attempt queries preserve existing no-detailed-answers fallback behavior.

## Changelog
### 2026-03-31
- Added regression tests for Slice 29 attempts feedback hardening in `QuizClassResultsModal`.
