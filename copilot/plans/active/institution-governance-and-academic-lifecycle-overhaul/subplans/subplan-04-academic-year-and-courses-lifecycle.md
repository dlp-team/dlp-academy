<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/subplans/subplan-04-academic-year-and-courses-lifecycle.md -->

# Subplan 04 - Academic Year and Courses Lifecycle

## Scope
- Mandatory academic year format + auto-fill + picker.
- Academic year ownership and subject lifecycle state.
- Courses tab year filtering and nested collapsibles.
- History tab removal.

## Proposed Ownership
- Course owns `academicYear` as canonical source (classes derive from selected course).
- Subjects inherit and do not override under normal UI flow.

## Acceptance Criteria
- New/edited classes enforce `YYYY-YYYY`.
- Home history mode and send-to-history pathways are removed without breaking grouped subject visibility.
- Role-aware visual indicators render correctly.

## Status
- IN_PROGRESS

## Progress Notes
- 2026-04-02: Slice 01 completed academic-year governance baseline in institution-admin course/class flows.
- 2026-04-02: Slice 02 completed Home history/send-to-history retirement and persisted-mode fallback coverage.

