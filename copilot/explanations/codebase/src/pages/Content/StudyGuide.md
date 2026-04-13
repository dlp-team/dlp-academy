# StudyGuide.tsx

## Overview
- **Source file:** `src/pages/Content/StudyGuide.tsx`
- **Last documented:** 2026-04-04
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
- 2026-04-13: Improved ask-teacher discoverability by adding a visible "Preguntar al profesor" action button in StudyGuide and allowing the flow for any authenticated StudyGuide viewer (no strict student-only gate).
- 2026-04-13: Extended contextual question capture to support both selected text and selected formulas; formula nodes now expose explicit selection metadata for right-click messaging.
- 2026-04-13: StudyGuide teacher-question payload now persists snippet metadata (`selectionSnippet`, `selectionType`) so chat references can display the exact selected context.
- 2026-04-13: Added student-only contextual question flow in StudyGuide: right-click selected text -> "Preguntar al profesor" -> choose teacher recipient -> send direct message with selected snippet and guide reference route.
- 2026-04-04: Consolidated `StudyGuide` into TypeScript-only implementation by removing duplicate `StudyGuide.jsx` and keeping lifecycle access guard (`canUserAccessSubject(...)`) in `StudyGuide.tsx`.
- 2026-04-03: Added lifecycle-aware subject access gate via `canUserAccessSubject(...)` during subject context load; direct guide entry now redirects to Home when subject visibility policy denies access.
- 2026-04-01: Added deterministic page-level navigation coverage in `tests/unit/pages/content/StudyGuide.navigation.test.jsx` for TOC-driven section jumps and keyboard arrow progression to block navigation regressions.
- 2026-03-29: StudyGuide flow now supports location-state prefetch consumption in runtime; fallback tests were aligned to router context expectations to preserve controlled "contenido no disponible" behavior.
- 2026-04-01: Fixed keyboard-navigation hook dependency crash by converting section navigation callbacks (`navigateToNextSection`, `navigateToPreviousSection`) from TDZ-prone callback constants to function declarations.
