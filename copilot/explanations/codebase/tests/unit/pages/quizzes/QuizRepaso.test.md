<!-- copilot/explanations/codebase/tests/unit/pages/quizzes/QuizRepaso.test.md -->
# QuizRepaso.test.jsx

## Overview
- **Source file:** `tests/unit/pages/quizzes/QuizRepaso.test.jsx`
- **Last documented:** 2026-03-31
- **Role:** Regression coverage for QuizRepaso session fallback determinism.

## Coverage
- Corrupted `sessionStorage.repasoQuestions` payloads render explicit warning feedback in no-questions state.
- Empty/absent repaso payloads keep existing no-warning empty-state behavior.
- Missing route params trigger deterministic `/home` fallback navigation on recovery action.

## Changelog
### 2026-03-31
- Added initial page-level tests for corrupted-session fallback messaging.
- Added no-warning guard for normal empty repaso payloads.
- Added back-route fallback coverage for missing topic route params.
