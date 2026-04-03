# useHomeControlsHandlers.js

## Changelog
### 2026-04-03: Added subject period filter handler
- Added `handleSubjectPeriodFilterChange` to update `subjectPeriodFilter` and persist via `onPreferenceChange`.
- Keeps period-filter preference wiring aligned with existing Home control persistence patterns.

### 2026-04-02: Added active/current lifecycle visibility handler
- Added `handleShowOnlyCurrentSubjectsChange` to update `showOnlyCurrentSubjects` and persist via `onPreferenceChange`.
- Keeps lifecycle-visibility preference behavior aligned with existing Home control persistence flow.

### 2026-04-02: Added courses academic-year range filter handler
- Added `handleCoursesAcademicYearFilterChange` to update `coursesAcademicYearFilter` state and persist selection via `onPreferenceChange`.
- Keeps courses academic-year filter selections durable across sessions while preserving existing mode/layout/tag handlers.

### 2026-04-02: Retired history mode from Home mode switcher
- Removed `history` from `HOME_VIEW_MODES`; available modes now remain `grid`, `usage`, `courses`, `shared`, and `bin`.
- Preserved existing mode-change reset behavior (tag filters, collapsed groups, and current folder reset) while removing only the retired mode entry.

### 2026-04-01: Added history mode option
- Added `HOME_VIEW_MODES` entry `{ id: 'history', label: 'Historial' }`.
- Preserves existing reset behavior (tags/collapsed/current folder) when switching modes.

## Overview
- **Source file:** `src/pages/Home/hooks/useHomeControlsHandlers.ts`
- **Last documented:** 2026-04-03
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Handles user events and triggers updates/actions.

## Exports
- `const HOME_VIEW_MODES`
- `default useHomeControlsHandlers`

## Main Dependencies
- `react`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
