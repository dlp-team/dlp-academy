# useHomeState.js

## Changelog
### 2026-04-03: Post-course policy visibility after extraordinary cutoff
- Usage/courses grouped subjects now apply post-extraordinary visibility policy filtering via `isSubjectVisibleByPostCoursePolicy(...)`.
- Implemented policy behavior:
	- `delete` => hide subject,
	- `retain_teacher_only` => hide for students, keep for teacher/staff,
	- `retain_all_no_join` => keep visible.

### 2026-04-03: Role-aware lifecycle visibility with period windows
- `showOnlyCurrentSubjects` filtering now evaluates period lifecycle windows when subject timeline bounds are available.
- Integrated `isSubjectActiveInPeriodLifecycle(...)` decision path for usage/courses current-only filtering:
	- students marked as passed are hidden after ordinary cutoff,
	- teachers remain visible through extraordinary cutoff,
	- all roles are hidden after extraordinary cutoff.
- Legacy subjects without period windows keep academic-year fallback behavior.

### 2026-04-03: Subject period filter in Home usage/courses views
- Added persisted `subjectPeriodFilter` state with option clamping against visible period metadata.
- Added `availableSubjectPeriods` derivation from visible and role-allowed subjects (`periodType` + `periodIndex`).
- Applied period filtering in grouped content and grouped search results for `usage` and `courses` views.
- Exposed new outputs from the hook: `subjectPeriodFilter`, `setSubjectPeriodFilter`, and `availableSubjectPeriods`.

### 2026-04-02: Active/current visibility toggle and lifecycle filtering
- Added persisted `showOnlyCurrentSubjects` state for Home `courses` and `usage` modes.
- Grouped-content generation now filters to current lifecycle subjects when the toggle is enabled.
- Search results in `courses`/`usage` context now apply the same lifecycle visibility filter.

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
- **Last documented:** 2026-04-03
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
