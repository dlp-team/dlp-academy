<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/overlay-phase-redo-generalized-create-overlays.md -->
# Lossless Report - Overlay Phase Redo (Generalized Create/Edit Overlays)

## 1. Requested Scope
- Redo overlay phase with a generalized and maintainable style for create/edit overlays.
- Ensure overlays are constrained between app header and bottom viewport.
- Support outside-click close where allowed.
- Require discard confirmation when closing with modified form state.
- Centralize width/height handling in the shared overlay component.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No Firestore schema or backend function behavior changes.
- No permission model changes.
- No business-rule changes for course/class/subject creation payload semantics.
- No visual redesign beyond shell unification and close-safety behavior.

## 3. Touched Files
- [src/components/ui/DashboardOverlayShell.tsx](src/components/ui/DashboardOverlayShell.tsx)
- [src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx](src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx)
- [src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx](src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx)
- [src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx](src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx)
- [src/pages/InstitutionAdminDashboard/components/AddTeacherModal.tsx](src/pages/InstitutionAdminDashboard/components/AddTeacherModal.tsx)
- [src/pages/Home/modals/SubjectModal.tsx](src/pages/Home/modals/SubjectModal.tsx)
- [src/pages/Home/modals/EditSubjectModal.tsx](src/pages/Home/modals/EditSubjectModal.tsx)
- [tests/unit/components/DashboardOverlayShell.test.jsx](tests/unit/components/DashboardOverlayShell.test.jsx)
- [tests/unit/pages/home/HomeSubjectModals.test.jsx](tests/unit/pages/home/HomeSubjectModals.test.jsx)

## 4. Per-File Verification
- `DashboardOverlayShell` now provides:
  - constrained root defaults below header (`inset-x bottom + top offset`),
  - width preset + height-class controls,
  - render-prop `requestClose` for consistent close wiring,
  - unsaved-change confirmation modal before dismiss.
- Institution Admin classes/courses shared `Modal` wrapper now routes close actions through shell guard and supports dirty-close options.
- `CreateCourseModal` and `CreateClassModal` now compute dirty state and use guarded close flow for cancel/header/outside dismisses.
- `AddTeacherModal`, `SubjectModal`, and `EditSubjectModal` migrated to shell-level style/close behavior with unsaved-close confirmation.

## 5. Risks and Checks
- Risk: dirty-state confirmations could block expected immediate close paths.
  - Check: clean-state backdrop-close tests preserved and passing.
- Risk: generalized shell changes could regress existing Institution Admin overlay consumers.
  - Check: shared shell tests and create modal tests pass with unchanged payload expectations.
- Risk: open-time snapshot race could create false dirty confirmations.
  - Check: modal snapshot guard adjusted; dedicated regression test added for modified-form confirm path.

## 6. Validation Summary
- Diagnostics:
  - `get_errors` on touched source/test files -> No errors found.
- Targeted regression tests:
  - `npm run test -- tests/unit/components/DashboardOverlayShell.test.jsx tests/unit/pages/home/HomeSubjectModals.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx` -> PASS.
- Static gates:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
