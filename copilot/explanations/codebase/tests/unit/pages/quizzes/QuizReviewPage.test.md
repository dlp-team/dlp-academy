<!-- copilot/explanations/codebase/tests/unit/pages/quizzes/QuizReviewPage.test.md -->
# QuizReviewPage.test.jsx

## Overview
- **Source file:** `tests/unit/pages/quizzes/QuizReviewPage.test.jsx`
- **Last documented:** 2026-03-31
- **Role:** Regression coverage for QuizReviewPage load fallback determinism and preserved no-attempt behavior.

## Coverage
- Missing quiz document path renders explicit fallback card and recovery action.
- Permission-denied attempts query path renders explicit access fallback feedback.
- Empty successful attempts query preserves informational no-attempt state and avoids fallback error card.

## Changelog
### 2026-03-31
- Added initial page-level fallback coverage for QuizReviewPage reliability hardening.
- Added permission-denied and quiz-not-found regression guards to prevent silent failure regressions.
- Added empty-attempt success-path guard to preserve prior UX behavior.
