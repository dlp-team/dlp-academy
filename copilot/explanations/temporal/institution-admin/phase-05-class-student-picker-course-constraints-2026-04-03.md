<!-- copilot/explanations/temporal/institution-admin/phase-05-class-student-picker-course-constraints-2026-04-03.md -->
# Phase 05 Temporal Notes - Class Student Picker Course Constraints

## Context
Phase 05 started with a focused integrity slice: class assignment pickers were still showing all students even after selecting a course, allowing out-of-course assignments.

## Implemented Direction
- Added shared student-course eligibility resolver for create/edit class flows.
- Kept migration-safe compatibility by falling back to full student list when no link metadata exists yet.
- Integrated class-membership-derived links so eligibility works even before all student profiles are fully normalized.

## UX Behavior After Change
- Create class: student picker filters to selected course when links exist.
- Edit class: picker is course-aware and blocks adding new out-of-course students.
- Legacy data: explicit informational copy appears and full list is retained temporarily.

## Validation
- `get_errors` clean on touched files.
- `npm run test:unit -- tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx tests/unit/pages/institution-admin/studentCourseLinkUtils.test.js` passed.

## Follow-up in Phase 05
- Apply same linking constraints in institution-admin user linking surfaces (manual + CSV).
- Add transfer/promote flows with dry-run and rollback metadata.
