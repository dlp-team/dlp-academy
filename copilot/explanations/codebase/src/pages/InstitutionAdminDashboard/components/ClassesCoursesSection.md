<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.md -->
# ClassesCoursesSection.jsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.jsx`
- **Last documented:** 2026-04-02
- **Role:** Institution Admin organization orchestrator for course/class navigation, CRUD wiring, bin lifecycle actions, and modal coordination.

## Responsibilities
- Persists active organization tab per institution scope.
- Coordinates selected detail state for course/class views.
- Wires create/update/delete handlers from `useClassesCourses` to list/detail UI components.
- Controls creation modals (`CreateCourseModal`, `CreateClassModal`) and submission feedback.
- Enforces in-page confirmation-first deletion for courses/classes through shared modal state.
- Adds dedicated `Papelera` tab for trashed courses/classes with restore and permanent-delete actions.
- Requires typed-name confirmation only for permanent delete actions.

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
- 2026-04-02: Added institution-admin `Papelera` tab with trashed courses/classes listing, restore actions, and permanent-delete routing.
- 2026-04-02: Updated confirmation modal behavior to distinguish `trash` vs `permanent` actions and enforce typed-name confirmation only for permanent deletion.
- 2026-03-30: Replaced `window.confirm(...)` delete flows for courses/classes with queued in-page confirmation modal (`deleteConfirm`, `confirmDelete`, `closeDeleteConfirm`).
- 2026-03-30: Preserved existing destructive semantics (course delete keeps class docs intact warning; selected detail resets after confirmed delete).
