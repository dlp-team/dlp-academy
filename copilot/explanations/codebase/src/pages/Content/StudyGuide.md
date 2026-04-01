# StudyGuide.jsx

## Overview
- **Source file:** `src/pages/Content/StudyGuide.jsx`
- **Last documented:** 2026-02-24
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `default StudyGuide`

## Main Dependencies
- `react`
- `react-router-dom`
- `firebase/firestore`
- `../../firebase/config`
- `react-katex`
- `katex/dist/katex.min.css`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
- 2026-04-01: Added deterministic page-level navigation coverage in `tests/unit/pages/content/StudyGuide.navigation.test.jsx` for TOC-driven section jumps and keyboard arrow progression to block navigation regressions.
- 2026-03-29: StudyGuide flow now supports location-state prefetch consumption in runtime; fallback tests were aligned to router context expectations to preserve controlled "contenido no disponible" behavior.
- 2026-04-01: Fixed keyboard-navigation hook dependency crash by converting section navigation callbacks (`navigateToNextSection`, `navigateToPreviousSection`) from TDZ-prone callback constants to function declarations.
