# QuizReviewDetail.jsx

## Overview
- **Source file:** `src/components/modules/QuizEngine/QuizReviewDetail.jsx`
- **Last documented:** 2026-03-29
- **Role:** Reusable quiz-review component for per-question answer breakdown.

## Responsibilities
- Renders per-question detail cards (question text, optional formula, user answer, correct answer when needed).
- Shows visual correctness indicators for each entry.
- Handles empty input safely by rendering null.
- Preserves LaTeX rendering through shared quiz math helpers.

## Exports
- `default QuizReviewDetail`

## Main Dependencies
- `react`
- `lucide-react`
- `react-katex`
- `./QuizCommon`

## Changelog
- 2026-03-29: Added full dark-mode visual variants for review cards, formula panels, answer chips, correctness icons, and helper footer text.

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/components/modules/QuizEngine` for maintenance and onboarding.
