# StudyGuideEditor.tsx

## Overview
- **Source file:** `src/pages/Content/StudyGuideEditor.tsx`
- **Last documented:** 2026-02-24
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `default StudyGuideEditor`

## Main Dependencies
- `react`
- `react-router-dom`
- `firebase/firestore`
- `../../firebase/config`
- `../../utils/permissionUtils`
- `../../utils/subjectAccessUtils`
- `react-katex`
- `katex/dist/katex.min.css`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
- 2026-04-03: Added lifecycle-aware subject access gate via `canUserAccessSubject(...)` after topic edit-permission check so direct editor entry respects post-course visibility policy.
