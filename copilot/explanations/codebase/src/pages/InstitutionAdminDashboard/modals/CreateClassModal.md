<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/modals/CreateClassModal.md -->
# CreateClassModal.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx`
- **Last documented:** 2026-04-02
- **Role:** Class creation modal where academic year is inherited from selected course.

## Responsibilities
- Builds class name from selected course + identifier.
- Keeps teacher/student picker behavior unchanged.
- Derives `academicYear` from selected course; shows fallback message for legacy invalid courses.
- Removes free-form year editing from class creation path.
- Constrains student picker options to students linked with the selected course (with legacy fallback when no links exist yet).

## Exports
- `default CreateClassModal`

## Changelog
- 2026-04-05: Integrated shared overlay dirty-close interception for class creation by enabling shell-level unsaved-change confirmation and guarded cancel/header dismiss actions.
- 2026-04-03: Added course-constrained student picker filtering with compatibility fallback and stale-selection cleanup on course change.
- 2026-04-03: Updated course selector labels to use shared `Nombre (AAAA-AAAA)` formatting for cross-year name disambiguation.
- 2026-04-02: Switched class creation to course-derived academic year with fallback handling and warning copy.
