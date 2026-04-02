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

## Exports
- `default ClassDetail`

## Changelog
- 2026-04-02: Removed direct class academic-year editing and aligned updates to course-derived year ownership.
- 2026-04-02: Included derived year in header/stats and identifier save payload.
