<!-- copilot/explanations/codebase/tests/unit/pages/quizzes/Quizzes.test.md -->
# Quizzes.test.jsx

## Overview
- **Source file:** `tests/unit/pages/quizzes/Quizzes.test.jsx`
- **Last documented:** 2026-03-31
- **Role:** Regression coverage for Quizzes runtime load fallback determinism.

## Coverage
- Missing quiz document path renders explicit fallback state and keeps route recovery action available.
- Permission-denied quiz read path renders explicit access fallback feedback.
- Successful quiz load path keeps the review/start flow available and avoids fallback rendering.
- Permission-denied quiz-result persistence path renders explicit save-feedback warning in results state.

## Changelog
### 2026-03-31
- Added save-failure regression coverage for denied final-result persistence in quiz completion flow.
- Added initial page-level fallback coverage for Quizzes runtime load hardening.
- Added navigation-preservation assertion for fallback recovery action.
- Added regression guard to preserve successful review-start availability.
