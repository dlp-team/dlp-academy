<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.md -->
# ClassDetail.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.tsx`
- **Last documented:** 2026-04-02
- **Role:** Detail view/editor for class records with course-derived academic-year consistency.

## Responsibilities
- Handles inline edit flows for class identity, teacher, and students.
- Derives academic year from selected course (fallback to legacy/default) instead of free-form editing.
- Displays year as read-only informational metadata with archived badge state.
- Restricts editable student picker options to course-eligible students while preserving visibility of already-selected legacy enrollments for cleanup.
- Normalizes `studentIds` when class course changes so incompatible students are removed from the save payload (unless legacy fallback mode is active).

## Exports
- `default ClassDetail`

## Changelog
- 2026-04-03: Identifier save now revalidates enrolled students against the new selected course and trims incompatible memberships when links are available.
- 2026-04-03: Added course-aware student picker filtering with legacy fallback messaging and safeguards that block adding new out-of-course students.
- 2026-04-03: Switched course labels in header badge, stats, course picker, and preview to shared `Nombre (AAAA-AAAA)` formatting for cross-year disambiguation.
- 2026-04-02: Removed direct class academic-year editing and aligned updates to course-derived year ownership.
- 2026-04-02: Included derived year in header/stats and identifier save payload.
