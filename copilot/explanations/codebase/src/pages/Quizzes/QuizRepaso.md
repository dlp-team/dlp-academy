<!-- copilot/explanations/codebase/src/pages/Quizzes/QuizRepaso.md -->
# QuizRepaso.jsx

## Overview
- **Source file:** `src/pages/Quizzes/QuizRepaso.jsx`
- **Last documented:** 2026-03-31
- **Role:** Topic-level remediation quiz page driven by failed-question session data.

## Responsibilities
- Hydrates failed-question payload from `sessionStorage` and normalizes quiz-question shape.
- Drives review/quiz/results state transitions for repaso workflow.
- Persists mastered question keys to Firestore (`repasoMastered`) at session end.
- Provides deterministic empty-state feedback when no repaso questions are available.
- Handles safe route recovery back to topic/home context.

## Exports
- `default QuizRepaso`

## Main Dependencies
- `react`
- `react-router-dom`
- `firebase/firestore`
- `../../firebase/config`
- `../../components/modules/QuizEngine/QuizCommon`
- `../../components/modules/QuizEngine/QuizHeader`
- `../../components/modules/QuizEngine/QuizOptions`
- `../../components/modules/QuizEngine/QuizQuestion`
- `../../components/modules/QuizEngine/QuizResults`
- `../../components/modules/QuizEngine/QuizFeedback`

## Changelog
### 2026-03-31
- Added explicit progress-save failure messaging (`saveError`) for `repasoMastered` persistence failures with permission-specific and generic feedback variants.
- Added inline warning banner rendering in results state so save failures are visible without blocking quiz completion.
- Cleared save feedback on retry to avoid stale warnings across attempts.
- Added explicit session-load fallback messaging (`failedQuestionsLoadError`) when persisted repaso payloads are corrupted or non-array.
- Added safe back-navigation fallback (`/home`) when topic route params are missing.
- Preserved existing no-questions state and valid repaso runtime behavior.
