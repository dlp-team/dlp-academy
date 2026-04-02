<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/subplans/subplan-04-academic-year-and-courses-lifecycle.md -->

# Subplan 04 - Academic Year and Courses Lifecycle

## Scope
- Mandatory academic year format + auto-fill + picker.
- Academic year ownership and subject lifecycle state.
- Courses tab year filtering and nested collapsibles.
- History tab removal.

## Proposed Ownership
- Course/class owns `academicYear` as canonical source.
- Subjects inherit and do not override under normal UI flow.

## Acceptance Criteria
- New/edited classes enforce `YYYY-YYYY`.
- Ended subjects move out of manual tab and remain discoverable in courses/usage.
- Role-aware visual indicators render correctly.

## Status
- PLANNED

