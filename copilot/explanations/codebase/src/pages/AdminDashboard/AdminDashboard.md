# AdminDashboard.jsx

## Overview
- **Source file:** `src/pages/AdminDashboard/AdminDashboard.jsx`
- **Last documented:** 2026-03-30
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `default AdminDashboard`

## Main Dependencies
- `react`
- `react-router-dom`
- `../../firebase/config`
- `../../components/layout/Header`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
### 2026-03-30
- Replaced browser `window.confirm(...)` dialogs in Admin institutions/users tabs with a shared in-page confirmation modal (`AdminConfirmModal`).
- Institution destructive actions now execute only after explicit modal confirmation:
	- enable/disable institution,
	- delete institution.
- User destructive actions now execute only after explicit modal confirmation:
	- enable/disable user,
	- role change.
- Added focused regression coverage in `tests/unit/pages/admin/AdminDashboard.confirmDialogs.test.jsx`.
- Hardened `UsersTab` pagination fetch lifecycle by refactoring `fetchUsers` to `useCallback` with explicit cursor input, removing stale effect dependency warnings while preserving existing pagination behavior.
- Added focused pagination regression coverage that verifies load-more queries use `startAfter(lastVisible)` and append next-page users.
