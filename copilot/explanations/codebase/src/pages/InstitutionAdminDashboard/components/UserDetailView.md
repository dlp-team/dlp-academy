<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/UserDetailView.md -->
# UserDetailView.tsx

## Overview
- Source file: `src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx`
- Last documented: 2026-04-04
- Role: Institution Admin detail page for a teacher or student with relationship metrics and class/course context.

## Responsibilities
- Loads selected user profile and related institution classes/courses/teachers.
- Computes role-specific metrics (classes, courses, students/teachers, subjects).
- Renders active and archived class rows in separate sections (`Clases asignadas`/`Clases donde está inscrito` and `Clases pasadas`).
- Handles profile media rendering with resilient fallback from storage URL to initials.
- Uses icon-based role badge rendering for teacher/student labels (emoji-free).
- Provides manual student-course linking controls (add/remove) with institution-scoped updates to profile link fields.

## Exports
- `default UserDetailView`

## Main Dependencies
- `react`
- `react-router-dom`
- `firebase/firestore`
- `../../../firebase/config`
- `../../../components/layout/Header`
- `../../../utils/courseLabelUtils`

## Changelog
- 2026-04-05: Added resilient profile-photo rendering with fallback to initials when image loading fails.
- 2026-04-05: Split user class rendering into active and archived (`Clases pasadas`) sections for both teacher and student detail views.
- 2026-04-05: Replaced emoji role badge labels with icon-based role labels (`Profesor` / `Alumno`).
- 2026-04-04: Added manual student-course linking management for student detail view with inline feedback and persisted updates to `courseId`, `courseIds`, and `enrolledCourseIds`.
- 2026-04-03: Updated related class row subtitles to shared `Nombre (AAAA-AAAA)` course labels for cross-year disambiguation.
