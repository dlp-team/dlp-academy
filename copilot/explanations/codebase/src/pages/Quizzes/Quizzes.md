# Quizzes.jsx

## Overview
- **Source file:** `src/pages/Quizzes/Quizzes.jsx`
- **Last documented:** 2026-02-24
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
- 2026-03-29: Fixed runtime crash in quiz execution/review flow by restoring local state for `answersDetail` and `previewAsStudent`, and by importing the missing icon symbols used in assignment/simulation banners.
- 2026-03-12: Runtime review screen now reads assignment metadata and enforces student availability windows before starting attempts, with explicit status messaging and disabled CTA when out of window.
