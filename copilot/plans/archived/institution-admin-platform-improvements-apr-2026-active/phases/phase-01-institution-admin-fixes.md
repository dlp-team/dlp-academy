# Phase 1 — Institution Admin Dashboard Fixes

## Status: DONE

## Objectives
1. **Academic configuration — period dates**: Add start and end date fields for each period inside the academic year. These dates become predefined defaults when creating a course (auto-filled but editable).
2. **Classes section — year/course/teacher filter**: Add a filter control in the classes list that allows filtering by academic year, course name, or teacher.
3. **Courses section — current-courses default**: Change the default display from "Todos" to show only current courses on first load. User must still be able to switch to all courses.
4. **Institution ID duplication fix**: The Institution ID is appearing duplicated below "Panel de Administración". Find and remove the duplicate render.

## Files Likely Touched
- `src/pages/InstitutionAdminDashboard/` — tabs, panels, hooks
- `src/pages/InstitutionAdminDashboard/hooks/useAcademicConfig.ts` (or similar)
- `src/pages/InstitutionAdminDashboard/components/classes-courses/` — CourseDetail, course list component
- `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx` — Institution ID duplication

## Acceptance Criteria
- [x] Academic year periods in Academic Config tab show start/end date fields
- [x] Creating a new course auto-populates period dates from the academic year config (editable)
- [x] Classes section has filter controls (academic year, course, teacher)
- [x] Courses section defaults to current courses only; toggle available to show all
- [x] Institution ID no longer duplicated in panel header area

## Validation
- [x] `npm run test` passes
- [x] `npm run lint` passes
- [x] `npx tsc --noEmit` passes
- [x] Visual check: course creation form shows pre-filled period dates
- [x] Visual check: classes filter works correctly
- [x] Visual check: courses default to current on load
- [x] Visual check: Institution ID appears once only

## Completion Notes
- Implemented 2026-04-12. Commits: `f1542d3` (initial), `b3ad912` (filter UX fix — Desde/Hasta sync, removed clear button).
- Filter change: selecting "Todos" in Desde or Hasta now resets both dropdowns (cleaner UX than clear button).

## Commits Required (minimum)
1. `fix(admin): Remove duplicate Institution ID in panel header`
2. `feat(academic-config): Add period start/end date fields with course defaulting`
3. `feat(classes): Add academic year and teacher filter controls`
4. `feat(courses): Default to current-only view on first load`
