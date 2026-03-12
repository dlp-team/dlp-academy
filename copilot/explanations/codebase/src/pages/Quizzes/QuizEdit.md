# QuizEdit.jsx

## Overview
- **Source file:** `src/pages/Quizzes/QuizEdit.jsx`
- **Last documented:** 2026-02-24
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `default QuizEdit`

## Main Dependencies
- `react`
- `react-router-dom`
- `firebase/firestore`
- `../../firebase/config`
- `../../utils/permissionUtils`
- `react-katex`
- `katex/dist/katex.min.css`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
- 2026-03-12: Added assignment configuration controls in edit mode: task toggle (`isAssignment`), start/end date window fields, and assignment-specific grading weight persistence.
- 2026-03-12: Hardened test save flow with explicit payload normalization/validation, inline save errors, and new `Para la nota` toggle so assignment weighting is only editable when grade contribution is enabled.
