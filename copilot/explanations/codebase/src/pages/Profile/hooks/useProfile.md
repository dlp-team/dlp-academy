# useProfile.js

## Overview
- **Source file:** `src/pages/Profile/hooks/useProfile.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Interacts with Firebase/Firestore services for data operations.

## Exports
- `const useProfile`

## Main Dependencies
- `react`
- `../../../firebase/config`
- `firebase/auth`
- `firebase/firestore`
- `../../../utils/badgeUtils`
- `../../../utils/permissionUtils`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
### 2026-04-02
- Added active-role resolution via `getActiveRole(...)` for profile runtime role checks.
- Badge-award authorization and teacher-assigned-student fetch path now use switched active role context instead of raw profile/base role fields.

### 2026-03-30
- Added teacher assigned-student resolution based on `classes.teacherId` + `studentIds`.
- Added course-scoped badge assignment (`awardBadgeToStudent`) with profile-state sync.
- Added automatic academic-excellence badge awarding from computed student averages.
- Hardened manual badge awarding to teacher/admin roles and assigned-student scope.
