# QuizClassResultsModal.jsx

## Overview
- **Source file:** `src/pages/Topic/components/QuizClassResultsModal.jsx`
- **Last documented:** 2026-03-29
- **Role:** Reusable UI component consumed by Topic quiz flows for teacher analytics.

## Responsibilities
- Displays class-level quiz metrics (average and participant count).
- Shows completed-student grades for the selected quiz, including avatar support.
- Loads and renders latest attempt detailed answers for a selected student.
- Provides teacher controls to set or clear score overrides.
- Exports roster grades to an Excel-compatible CSV file.
- Surfaces inline save/reset feedback for override operations.

## Exports
- `default QuizClassResultsModal`

## Main Dependencies
- `react`
- `lucide-react`
- `firebase/firestore`
- `../../../firebase/config`
- `../../../components/modules/QuizEngine/QuizReviewDetail`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
