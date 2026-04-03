<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/UserDetailView.md -->
# UserDetailView.tsx

## Overview
- Source file: `src/pages/InstitutionAdminDashboard/components/UserDetailView.tsx`
- Last documented: 2026-04-03
- Role: Institution Admin detail page for a teacher or student with relationship metrics and class/course context.

## Responsibilities
- Loads selected user profile and related institution classes/courses/teachers.
- Computes role-specific metrics (classes, courses, students/teachers, subjects).
- Renders related class rows with contextual course and teacher metadata.

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
- 2026-04-03: Updated related class row subtitles to shared `Nombre (AAAA-AAAA)` course labels for cross-year disambiguation.
