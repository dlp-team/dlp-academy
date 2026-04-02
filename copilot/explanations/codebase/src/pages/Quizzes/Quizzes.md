<!-- copilot/explanations/codebase/src/pages/Quizzes/Quizzes.md -->
# Quizzes.jsx

## Overview
- **Source file:** `src/pages/Quizzes/Quizzes.jsx`
- **Last documented:** 2026-03-31
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `default Quizzes`

## Main Dependencies
- `react`
- `react-router-dom`
- `firebase/firestore`
- `../../firebase/config`
- `../../components/modules/QuizEngine/QuizFeedback`
- `../../components/modules/QuizEngine/QuizHeader`
- `../../components/modules/QuizEngine/QuizQuestion`
- `../../components/modules/QuizEngine/QuizOptions`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
- 2026-04-02: Student runtime mode now derives from `getActiveRole(user)` (plus preview override), keeping assignment availability checks aligned with switched role context.
- 2026-03-31: Added explicit save-result failure feedback (`saveError`) for final quiz persistence errors with permission-specific and generic messaging.
- 2026-03-31: Added results-state warning banner rendering for save failures and reset behavior on retry to prevent stale feedback.
- 2026-03-31: Replaced silent/default runtime fallback behavior with explicit load-fallback states in `useQuizData` (missing route context, quiz-not-found, permission-denied, and generic load failures).
- 2026-03-31: Added shared in-page fallback renderer (`QuizFallbackState`) to keep recovery UX deterministic and preserve `Volver al tema` navigation from failed quiz loads.
- 2026-03-29: Added full dark-mode support to `QuizRepaso` flow (empty/saving/review/quiz shells) for consistent dark appearance across all quiz variants.
- 2026-03-29: Completed dark-mode consistency across review surfaces by aligning standalone review page and detailed answer blocks with the quiz runtime dark palette.
- 2026-03-29: Added full dark-mode visual support for quiz review and attempt flows (review hero, assignment status blocks, quiz runtime shell, and preview banner) while preserving existing interactions and scoring behavior.
- 2026-03-29: Fixed runtime crash in quiz execution/review flow by restoring local state for `answersDetail` and `previewAsStudent`, and by importing the missing icon symbols used in assignment/simulation banners.
- 2026-03-12: Runtime review screen now reads assignment metadata and enforces student availability windows before starting attempts, with explicit status messaging and disabled CTA when out of window.
