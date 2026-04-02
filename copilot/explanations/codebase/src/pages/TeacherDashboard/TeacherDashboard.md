# TeacherDashboard.jsx

## Overview
- **Source file:** `src/pages/TeacherDashboard/TeacherDashboard.jsx`
- **Last documented:** 2026-02-24
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `default TeacherDashboard`

## Main Dependencies
- `react`
- `react-router-dom`
- `../../firebase/config`
- `../../components/layout/Header`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
### 2026-04-02
- Updated dashboard guard to evaluate `getActiveRole(user)` so teacher view access follows selected role context in dual-role sessions.

### 2026-03-30
- Added `subjects` tab with per-subject summary (course, student count, topic count).
- Added teacher student-table actions to set `behaviorScore` and award manual badges (`participacion`, `esfuerzo`).
- Added optimistic local-state sync and action feedback for student recognition updates.
