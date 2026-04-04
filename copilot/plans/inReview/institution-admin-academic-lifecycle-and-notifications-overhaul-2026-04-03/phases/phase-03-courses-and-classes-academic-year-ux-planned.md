<!-- copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-03-courses-and-classes-academic-year-ux-planned.md -->
# Phase 03 - Courses and Classes Academic-Year UX (COMPLETED)

## Objective
Make academic year a first-class organizing axis in Institution Admin course/class management and subject assignment flows.

## Planned Changes
- Collapsible course/class groups by academic year in Institution Admin dashboard.
- Add academic-year start/end range filter.
- Ensure course labels include academic year where ambiguity exists.
- Lock class academic year to linked course academic year.
- Restrict class assignment in subject edit/create flows to same academic year.

## Progress Notes
- Added shared `src/utils/courseLabelUtils.ts` formatter for disambiguated `Nombre (AAAA-AAAA)` labels.
- Added organization toolbar controls for academic-year range filtering (`Desde`/`Hasta`) across courses and classes.
- Added collapsible grouped rendering by academic year for both courses and classes in Institution Admin.
- Applied disambiguated labels to:
  - subject basic course selector
  - create-class course selector
  - class detail badge/stats/course selector/preview
  - class list table course column
  - course cards list titles
  - organization bin trashed-course rows
  - institution user detail related-class subtitles
- Updated subject classes-tab loader to filter available classes by subject academic year when defined.
- Updated subject course selector state to persist `courseId` alongside course name, eliminating duplicate-name ambiguity in create/edit flows.
- Normalized subject save payloads (`general` + `classes` tabs) to persist `course`, `courseId`, and `academicYear` consistently.
- Hardened class create/update data layer (`useClassesCourses`) so class `academicYear` is reconciled from linked course metadata whenever a course link exists.
- Added deterministic unit coverage for label formatter behavior in `tests/unit/utils/courseLabelUtils.test.js`.
- Added deterministic unit coverage for optional `courseId`/`academicYear` normalization in `tests/unit/utils/subjectAccessUtils.test.js`.

## Risks and Controls
- Risk: inconsistent labels across dropdowns and cards.
  - Control: centralize label formatter in shared utility.
- Risk: stale classes displayed in subject form.
  - Control: filter by selected/derived academic year before render.

## Exit Criteria
- Users cannot create/edit classes with academic year mismatch.
- Subject class selector only shows same-year classes.
