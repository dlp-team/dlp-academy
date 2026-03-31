<!-- copilot/explanations/codebase/src/pages/Quizzes/QuizReviewPage.md -->
# QuizReviewPage.jsx

## Overview
- **Source file:** `src/pages/Quizzes/QuizReviewPage.jsx`
- **Last documented:** 2026-03-31
- **Role:** Student-facing quiz review route that loads latest attempt context and renders detailed review/fallback feedback.

## Responsibilities
- Resolves route context (`subjectId`, `topicId`, `quizId`) and loads related quiz-review data.
- Enforces subject access checks before revealing quiz review details.
- Derives deterministic visual context from topic color tokens.
- Renders latest attempt summary and answer-detail review when available.
- Surfaces explicit fallback states for missing quiz/review access/load failures.

## Exports
- `default QuizReviewPage`

## Main Dependencies
- `react`
- `react-router-dom`
- `firebase/firestore`
- `../../firebase/config`
- `../../components/modules/QuizEngine/QuizReviewDetail`
- `../../components/modules/QuizEngine/QuizCommon`
- `../../utils/subjectAccessUtils`

## Notes
- Route preserves backward navigation to the topic context when route params are complete and falls back to `/home` otherwise.

## Changelog
### 2026-03-31
- Added explicit load-fallback state (`loadError`) for missing route context, quiz-not-found, permission-denied attempt reads, and generic load failures.
- Added deterministic fallback UI card (`No se pudo abrir la revision`) with preserved recovery action (`Volver al tema`).
- Preserved existing no-attempt success state for empty attempts query results.
