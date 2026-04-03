<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-04-subject-periods-and-lifecycle-automation-planned.md -->
# Phase 04 - Subject Periods and Lifecycle Automation (IN_PROGRESS)

## Objective
Model and enforce subject period windows and automatic lifecycle transitions with role-aware visibility.

## Planned Changes
- Require period metadata on subject creation.
- Add home filter by trimester/cuatrimester/custom period.
- Implement lifecycle transition logic:
  - period-end behavior
  - ordinary vs extraordinary handling
  - role-sensitive visibility for teachers and students

## Progress Notes
- Added institution-driven period option modeling in `SubjectFormModal` based on `academicCalendar.periodization`.
- Added general-tab period selector with mandatory validation on subject creation.
- Subject save payloads now persist period metadata fields:
  - `periodType`
  - `periodLabel`
  - `periodIndex`
- Added normalization for the new fields in:
  - `src/hooks/useHomeHandlers.ts`
  - `src/hooks/useSubjects.ts`
  - `src/utils/subjectAccessUtils.ts`
- Added unit coverage updates in `tests/unit/utils/subjectAccessUtils.test.js`.
- Added Home controls period selector (`Periodo`) for `courses` and `usage` modes with persisted preference key `subjectPeriodFilter`.
- Added Home state derivation for `availableSubjectPeriods` and period-filter application across grouped content and search results in `courses`/`usage` modes.
- Added deterministic unit coverage updates in:
  - `tests/unit/hooks/useHomeState.academicYearFilter.test.js`
  - `tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx`
- Added timeline-bound metadata generation on subject save using institution calendar inputs:
  - `periodStartAt`
  - `periodEndAt`
  - `periodExtraordinaryEndAt`
- Added lifecycle utility modeling in `src/utils/subjectPeriodLifecycleUtils.ts` for:
  - timeline generation,
  - role-aware extraordinary-window visibility decisions.
- Subject save payloads now persist `postCoursePolicy` snapshots from institution settings for lifecycle visibility decisions.
- Home `showOnlyCurrentSubjects` filtering now uses period lifecycle windows when available, with academic-year fallback for legacy subjects.
- Home `usage`/`courses` grouping now applies post-extraordinary visibility filtering by `postCoursePolicy`:
  - `delete` => hidden,
  - `retain_teacher_only` => teacher/staff visible, students hidden,
  - `retain_all_no_join` => visible.
- Added deterministic lifecycle matrix coverage in:
  - `tests/unit/utils/subjectPeriodLifecycleUtils.test.js`
  - `tests/unit/hooks/useHomeState.academicYearFilter.test.js`
  - `tests/unit/utils/subjectAccessUtils.test.js`

## Risks and Controls
- Risk: incorrect hiding of active content.
  - Control: role and pass-status decision matrix tests.

## Exit Criteria
- Lifecycle transitions align with configured institutional calendar and policy.
