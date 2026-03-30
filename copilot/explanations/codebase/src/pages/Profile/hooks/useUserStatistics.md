# useUserStatistics.js

## Overview
- **Source file:** `src/pages/Profile/hooks/useUserStatistics.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Interacts with Firebase/Firestore services for data operations.

## Exports
- `default useUserStatistics`

## Main Dependencies
- `react`
- `../../../firebase/config`
- `firebase/firestore`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
### 2026-03-30
- Added aggregate statistics mode for teacher profile views (`aggregateMode`, `aggregateUserIds`, `aggregateUsersById`).
- Added explicit empty-state handling when aggregate mode is requested but no assigned students are available.
- Preserved single-user statistics behavior for student views.
