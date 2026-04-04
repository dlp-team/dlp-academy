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
- Passes current class collection into class create/detail views so enrollment eligibility can resolve against course and existing class memberships.
- Enforces in-page confirmation-first deletion for courses/classes through shared modal state.
- Adds dedicated `Papelera` tab for trashed courses/classes with restore and permanent-delete actions.
- Requires typed-name confirmation only for permanent delete actions.
- Displays retention countdown messaging for trashed courses/classes.
- Adds course-tab entrypoint (`Vincular cursos por CSV`) using shared import workflow modal.

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
- `../../../utils/courseLabelUtils`

## Changelog
- 2026-04-04: Wired rollback callback (`rollbackTransferPromotionPlanById`) into transfer modal so applied transfer runs can be reversed from organization tab.
- 2026-04-04: Extended transfer/promotion modal wiring with apply callback (`applyTransferPromotionDryRunPlan`) so dry-run plans can be executed from the same UI flow.
- 2026-04-04: Added courses-tab trigger `Simular traslado/promoción` and wired `TransferPromotionDryRunModal` to execute institution-scoped dry-run previews through `useClassesCourses`.
- 2026-04-04: Added courses-tab CSV workflow launcher and shared modal wiring to support storage upload + manual/n8n course-link imports.
- 2026-04-03: Injected live `classes` into `CreateClassModal` and `ClassDetail` to support Phase 05 course-constrained student eligibility checks.
- 2026-04-03: Added `Desde/Hasta` academic-year range filters and collapsible year-group sections for both courses and classes in organization tab.
- 2026-04-03: Updated trashed-course rows in `Papelera` to use shared `Nombre (AAAA-AAAA)` label formatting.
- 2026-04-02: Added defensive academic-year validation gates on `handleCreateCourse` and `handleCreateClass` before delegating to hook writes.
- 2026-04-02: Added retention-window countdown copy in bin rows (`Se eliminará automáticamente en ...`) for trashed courses/classes.
- 2026-04-02: Added institution-admin `Papelera` tab with trashed courses/classes listing, restore actions, and permanent-delete routing.
- 2026-04-02: Updated confirmation modal behavior to distinguish `trash` vs `permanent` actions and enforce typed-name confirmation only for permanent deletion.
- 2026-03-30: Replaced `window.confirm(...)` delete flows for courses/classes with queued in-page confirmation modal (`deleteConfirm`, `confirmDelete`, `closeDeleteConfirm`).
- 2026-03-30: Preserved existing destructive semantics (course delete keeps class docs intact warning; selected detail resets after confirmed delete).
