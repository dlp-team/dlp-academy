<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-05-student-course-linking-and-transfer-planned.md -->
# Phase 05 - Student-Course Linking and Transfer Flows (PLANNED)

## Objective
Implement safe pathways to link students to courses (CSV/manual), constrain class assignment by course, and support next-year transfer/promotion flows.

## Planned Changes
- Student-course linking via CSV import wizard and manual assignment path.
- Class assignment picker constrained to students in selected course.
- Course hierarchy configuration (common presets + custom order).
- Next-academic-year course duplication/transfer tooling with visibility controls.

## Risks and Controls
- Risk: orphaned student mappings after transfer.
  - Control: idempotent transfer operation and rollback metadata.
- Risk: accidental student access carryover.
  - Control: explicit visibility defaults and enrollment mode review.

## Exit Criteria
- Admin can link students at scale and manually.
- Transfer flow creates predictable next-year courses without exposing them prematurely.
