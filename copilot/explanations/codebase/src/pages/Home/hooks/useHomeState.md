# useHomeState.js

## Changelog
### 2026-04-02: Courses academic-year range filtering and multi-year labels
- Added persisted `coursesAcademicYearFilter` state (`startYear`/`endYear`) with normalization against available academic years.
- Added `availableCourseAcademicYears` derivation from visible subjects for courses-tab filter options.
- Courses grouping now filters by academic-year range and appends `(YYYY-YYYY)` to course bucket labels when multiple academic years are visible.
- Multi-year course buckets are emitted in academic-year-first order to support nested year-wrapper rendering in Home content.

### 2026-04-02: History mode retirement and unified subject visibility
- Removed history-specific grouping paths so unsupported persisted `history` mode naturally falls back to regular grouped behavior.
- Removed completion-based exclusion from non-history groupings; completed subjects remain visible in manual and standard grouped views.

### 2026-04-01: Completion-aware active/history subject grouping
- Added `completedSubjectIds` input support and completion-ID normalization that works for source subjects and shortcut entries (`targetId`).
- Added `history` Home mode grouping (`Historial`) that renders completed subjects only.
- Active Home groupings now exclude completed subjects by default.
- Search grouping now respects active/history completion scope.

## Overview
- **Source file:** `src/hooks/useHomeState.ts`
- **Last documented:** 2026-04-02
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.

## Exports
- `const useHomeState`

## Main Dependencies
- `react`
- `../../../utils/stringUtils`
- `../../../hooks/useShortcuts`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
