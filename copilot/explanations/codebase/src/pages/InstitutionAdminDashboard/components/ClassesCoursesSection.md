<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.md -->
# ClassesCoursesSection.jsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.jsx`
- **Last documented:** 2026-03-30
- **Role:** Institution Admin organization orchestrator for course/class navigation, CRUD wiring, and modal coordination.

## Responsibilities
- Persists active organization tab per institution scope.
- Coordinates selected detail state for course/class views.
- Wires create/update/delete handlers from `useClassesCourses` to list/detail UI components.
- Controls creation modals (`CreateCourseModal`, `CreateClassModal`) and submission feedback.
- Enforces in-page confirmation-first deletion for courses/classes through shared modal state.

## Exports
- `default ClassesCoursesSection`

## Main Dependencies
- `react`
- `lucide-react`
- `../hooks/useClassesCourses.js`
- `./classes-courses/CourseList.jsx`
- `./classes-courses/CourseDetail.jsx`
- `./classes-courses/ClassList.jsx`
- `./classes-courses/ClassDetail.jsx`
- `../modals/CreateCourseModal.jsx`
- `../modals/CreateClassModal.jsx`
- `../../../hooks/usePersistentState.js`
- `../../../utils/pagePersistence.js`

## Changelog
- 2026-03-30: Replaced `window.confirm(...)` delete flows for courses/classes with queued in-page confirmation modal (`deleteConfirm`, `confirmDelete`, `closeDeleteConfirm`).
- 2026-03-30: Preserved existing destructive semantics (course delete keeps class docs intact warning; selected detail resets after confirmed delete).
