<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/phase-01-modal-and-scrollbar-kickoff.md -->
# Phase 01 Kickoff - Modal and Scrollbar Foundation

## Scope Slice
- Build the first reusable modal wrapper contract.
- Select and migrate low-risk confirmation modals first.
- Correct left-side scrollbar visual artifact without introducing global layout regressions.

## First Batch Candidate Files
- [src/components/modals/DeleteModal.tsx](src/components/modals/DeleteModal.tsx)
- [src/components/modals/FolderDeleteModal.tsx](src/components/modals/FolderDeleteModal.tsx)
- [src/pages/Home/components/HomeDeleteConfirmModal.tsx](src/pages/Home/components/HomeDeleteConfirmModal.tsx)
- [src/components/ui/CustomScrollbar.tsx](src/components/ui/CustomScrollbar.tsx)
- [src/index.css](src/index.css)

## Guardrails
- Keep existing modal close contracts stable per modal type.
- Do not alter required-form close flows unless dirty-state intercept behavior is explicitly configured.
- Verify desktop and mobile overlay fit after each migration step.

## Validation Plan
- Targeted tests:
  - modal outside-click behavior,
  - dirty-state close interception,
  - scrollbar layout shift and visual symmetry.
- Static checks:
  - npm run lint
  - npx tsc --noEmit
- Regression checks:
  - Home modals,
  - Institution Admin Sudo modal,
  - common confirm dialogs.

## Status Log
- 2026-04-05: Phase 01 set to IN_PROGRESS; kickoff inventory captured.
- 2026-04-05: Block A implemented.
  - Added [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx).
  - Migrated [src/components/modals/DeleteModal.tsx](src/components/modals/DeleteModal.tsx) and [src/pages/Home/components/HomeDeleteConfirmModal.tsx](src/pages/Home/components/HomeDeleteConfirmModal.tsx) to the shared base.
  - Fixed scrollbar left-gap artifact in [src/index.css](src/index.css) by switching to `scrollbar-gutter: stable`.
  - Added tests in [tests/unit/components/BaseModal.test.jsx](tests/unit/components/BaseModal.test.jsx) and re-ran nearby modal tests.
- 2026-04-05: Block B implemented.
  - Extended [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx) with close interception hooks and root style support.
  - Migrated [src/components/modals/FolderDeleteModal.tsx](src/components/modals/FolderDeleteModal.tsx) to `BaseModal` while preserving per-screen close semantics.
  - Added [tests/unit/components/FolderDeleteModal.test.jsx](tests/unit/components/FolderDeleteModal.test.jsx).
  - Expanded [tests/unit/components/BaseModal.test.jsx](tests/unit/components/BaseModal.test.jsx) for blocked-close coverage.
- 2026-04-05: Block C implemented.
  - Migrated [src/pages/Home/components/FolderManager.tsx](src/pages/Home/components/FolderManager.tsx) modal shell to `BaseModal`.
  - Adopted dirty-state close interception in FolderManager using [src/utils/modalCloseGuardUtils.ts](src/utils/modalCloseGuardUtils.ts).
  - Routed backdrop/header/footer close triggers through the same guard path.
  - Added [tests/unit/utils/modalCloseGuardUtils.test.js](tests/unit/utils/modalCloseGuardUtils.test.js).
- 2026-04-05: Block D implemented.
  - Migrated [src/components/modals/SudoModal.tsx](src/components/modals/SudoModal.tsx) to `BaseModal`.
  - Preserved submit-time close lock via guarded close logic.
  - Re-ran existing Sudo modal tests plus shared modal regression suite.
- 2026-04-05: Block E implemented.
  - Migrated [src/pages/Subject/modals/SubjectFormModal.tsx](src/pages/Subject/modals/SubjectFormModal.tsx) shell to `BaseModal`.
  - Reused [src/utils/modalCloseGuardUtils.ts](src/utils/modalCloseGuardUtils.ts) for dirty-state close decisions.
  - Routed SubjectFormModal backdrop/header/footer close actions through the same guarded close path.
  - Re-ran SubjectForm modal tests and shared modal/utility regression tests.
- 2026-04-05: Block F implemented.
  - Migrated [src/pages/Home/modals/SubjectModal.tsx](src/pages/Home/modals/SubjectModal.tsx) and [src/pages/Home/modals/EditSubjectModal.tsx](src/pages/Home/modals/EditSubjectModal.tsx) to `BaseModal`.
  - Added [tests/unit/pages/home/HomeSubjectModals.test.jsx](tests/unit/pages/home/HomeSubjectModals.test.jsx) for backdrop close behavior.
  - Re-ran Home/Subject modal regression targets and typecheck.
- 2026-04-05: Phase 01 closure validation completed.
  - `npm run lint` passed.
  - `npx tsc --noEmit` passed.
  - `npm run test` passed (138 files, 621 tests).
- 2026-04-05: Follow-up B slice 2 (generalized overlay phase redo) completed.
  - Expanded [src/components/ui/DashboardOverlayShell.tsx](src/components/ui/DashboardOverlayShell.tsx) with:
    - shared request-close API,
    - built-in unsaved-close confirmation,
    - configurable width/height constraint defaults under header-to-bottom viewport bounds.
  - Migrated create/edit overlays for subject/course/class and teacher authorization:
    - [src/pages/Home/modals/SubjectModal.tsx](src/pages/Home/modals/SubjectModal.tsx)
    - [src/pages/Home/modals/EditSubjectModal.tsx](src/pages/Home/modals/EditSubjectModal.tsx)
    - [src/pages/InstitutionAdminDashboard/components/AddTeacherModal.tsx](src/pages/InstitutionAdminDashboard/components/AddTeacherModal.tsx)
    - [src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx](src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx)
    - [src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx](src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx)
    - [src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx](src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx)
  - Added/updated regression coverage:
    - [tests/unit/components/DashboardOverlayShell.test.jsx](tests/unit/components/DashboardOverlayShell.test.jsx)
    - [tests/unit/pages/home/HomeSubjectModals.test.jsx](tests/unit/pages/home/HomeSubjectModals.test.jsx)
  - Validation evidence:
    - `npm run test -- tests/unit/components/DashboardOverlayShell.test.jsx tests/unit/pages/home/HomeSubjectModals.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)
