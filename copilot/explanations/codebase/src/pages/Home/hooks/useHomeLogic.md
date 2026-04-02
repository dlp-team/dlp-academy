<!-- copilot/explanations/codebase/src/pages/Home/hooks/useHomeLogic.md -->
# useHomeLogic.js

## Changelog
### 2026-04-02: Courses academic-year filter passthrough
- Added `coursesAcademicYearFilter`, `setCoursesAcademicYearFilter`, and `availableCourseAcademicYears` passthroughs from `useHomeState` into `useHomeLogic` return payload.
- Enables Home controls to render and persist courses-tab academic-year range selections.

### 2026-04-01: Completion tracking passthrough wiring
- Added `completedSubjectIds` and `setSubjectCompletion` passthroughs from `useSubjects`.
- Forwarded `completedSubjectIds` into `useHomeState` for active/history filtering.

### 2026-04-01: Exposed teacher subject-creation policy state
- Added `teacherSubjectCreationAllowed` passthrough from `useSubjects` into `useHomeLogic` return payload.
- Enables policy-aware create-subject gating in Home coordinator hooks.

### 2026-03-30: Home feedback callback threading
- Added optional `onHomeFeedback` argument passthrough from `useHomeLogic` to `useHomeHandlers`.
- Enables page-level inline feedback for drag/drop and nesting failures without browser alerts.

### 2026-03-09: Restored resolved shortcut contract
- Re-exposed `resolvedShortcuts` from `useHomeState` in `useHomeLogic` return payload.
- Fixes composed-hook contract used by `tests/unit/hooks/useHomeLogic.test.js` while preserving existing `shortcuts` passthrough.

### 2026-03-09: Exposed bin restore helpers for keyboard undo
- Added `getTrashedSubjects` and `restoreSubject` passthroughs from `useSubjects`.
- Preserves existing Home logic contracts while enabling Ctrl+Z restore fallback in keyboard flows.

## Overview
- **Source file:** `src/pages/Home/hooks/useHomeLogic.ts`
- **Last documented:** 2026-04-02
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Handles user events and triggers updates/actions.
- Participates in navigation/routing behavior.

## Exports
- `const useHomeLogic`

## Main Dependencies
- `react-router-dom`
- `../../../hooks/useSubjects`
- `../../../hooks/useFolders`
- `../../../hooks/useShortcuts`
- `../../../hooks/useUserPreferences`
- `../../../utils/folderUtils`
- `./useHomeState`
- `./useHomeHandlers`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
