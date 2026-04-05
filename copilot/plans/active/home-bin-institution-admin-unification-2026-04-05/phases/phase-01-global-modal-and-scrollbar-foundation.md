<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-01-global-modal-and-scrollbar-foundation.md -->
# Phase 01 - Global Modal and Scrollbar Foundation

## Status
- COMPLETED

## Objective
Create a reusable modal foundation and remove the left-side scrollbar compensation artifact without introducing layout regressions.

## Deliverables
- Shared modal primitive (for example BaseModal wrapper) with:
  - configurable width/height,
  - constrained viewport between header and screen bottom,
  - optional outside-click close behavior,
  - dirty-state close interception with confirmation flow.
- Migration plan for existing configure/edit/create modal variants to shared style.
- Scrollbar compensation cleanup so left-side visual gap disappears while preserving centered layout behavior.

## Lossless Constraints
- Preserve existing modal forms, validation flows, and required-field semantics.
- Do not change modal close behavior for hard-required workflows unless explicitly configured.
- Keep mobile and desktop modal responsiveness.

## Kickoff Findings and Initial Implementation Slice (2026-04-05)
- Priority modal unification candidates identified:
  - [src/components/modals/DeleteModal.tsx](src/components/modals/DeleteModal.tsx)
  - [src/components/modals/FolderDeleteModal.tsx](src/components/modals/FolderDeleteModal.tsx)
  - [src/components/modals/FolderTreeModal.tsx](src/components/modals/FolderTreeModal.tsx)
  - [src/components/modals/SudoModal.tsx](src/components/modals/SudoModal.tsx)
  - [src/pages/Home/modals/SubjectModal.tsx](src/pages/Home/modals/SubjectModal.tsx)
  - [src/pages/Home/modals/EditSubjectModal.tsx](src/pages/Home/modals/EditSubjectModal.tsx)
  - [src/pages/Home/components/HomeDeleteConfirmModal.tsx](src/pages/Home/components/HomeDeleteConfirmModal.tsx)
  - [src/pages/Home/components/HomeShareConfirmModals.tsx](src/pages/Home/components/HomeShareConfirmModals.tsx)
- Scrollbar artifact touchpoints identified:
  - [src/components/ui/CustomScrollbar.tsx](src/components/ui/CustomScrollbar.tsx)
  - [src/index.css](src/index.css) (`scrollbar-gutter: stable both-edges`)
- Initial Phase 01 execution order:
  1. Define and create base modal wrapper contract.
  2. Migrate lowest-risk confirm modals to wrapper.
  3. Patch scrollbar compensation strategy and validate global layout behavior.
  4. Expand wrapper adoption to higher-complexity modal surfaces.

## Implementation Progress - Block A (2026-04-05)
- Modal foundation created:
  - [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx)
- Low-risk migrations completed:
  - [src/components/modals/DeleteModal.tsx](src/components/modals/DeleteModal.tsx)
  - [src/pages/Home/components/HomeDeleteConfirmModal.tsx](src/pages/Home/components/HomeDeleteConfirmModal.tsx)
- Scrollbar compensation corrected:
  - [src/index.css](src/index.css)
  - Updated `scrollbar-gutter` from `stable both-edges` to `stable` to remove left-side reserved gutter.
- Tests added for modal foundation behavior:
  - [tests/unit/components/BaseModal.test.jsx](tests/unit/components/BaseModal.test.jsx)
- Validation evidence:
  - `npm run test:unit -- tests/unit/components/BaseModal.test.jsx tests/unit/components/BinConfirmModals.test.jsx` (PASS)
  - `get_errors` on touched files (clean)

## Implementation Progress - Block B (2026-04-05)
- Base modal close-interception contract expanded:
  - Added `onBeforeClose` and `onBlockedCloseAttempt` hooks in [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx).
  - Added `rootStyle` support for top-offset constrained overlays.
- Higher-complexity modal migration completed:
  - [src/components/modals/FolderDeleteModal.tsx](src/components/modals/FolderDeleteModal.tsx) now uses `BaseModal` on both main and confirmation screens.
  - Preserved screen-specific close semantics:
    - main screen backdrop closes modal,
    - confirmation screen backdrop returns to the previous step.
- Regression tests expanded:
  - [tests/unit/components/BaseModal.test.jsx](tests/unit/components/BaseModal.test.jsx) now verifies close-block behavior.
  - New [tests/unit/components/FolderDeleteModal.test.jsx](tests/unit/components/FolderDeleteModal.test.jsx) covers backdrop and action-flow semantics.
- Validation evidence:
  - `npm run test:unit -- tests/unit/components/BaseModal.test.jsx tests/unit/components/FolderDeleteModal.test.jsx tests/unit/components/BinConfirmModals.test.jsx` (PASS)
  - `npx tsc --noEmit` (PASS)
  - `get_errors` on touched files (clean)

## Implementation Progress - Block C (2026-04-05)
- First form/modal flow adopted dirty-state close interception:
  - [src/pages/Home/components/FolderManager.tsx](src/pages/Home/components/FolderManager.tsx)
  - Backdrop, header close, and footer cancel now share one guarded close evaluation path.
- Shared close guard utility extracted for deterministic behavior and reuse:
  - [src/utils/modalCloseGuardUtils.ts](src/utils/modalCloseGuardUtils.ts)
- FolderManager shell migrated to shared modal primitive:
  - Uses [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx) with `onBeforeClose`.
- Regression coverage added/expanded:
  - [tests/unit/utils/modalCloseGuardUtils.test.js](tests/unit/utils/modalCloseGuardUtils.test.js)
  - [tests/unit/components/BaseModal.test.jsx](tests/unit/components/BaseModal.test.jsx)
- Validation evidence:
  - `npm run test:unit -- tests/unit/utils/modalCloseGuardUtils.test.js tests/unit/components/BaseModal.test.jsx tests/unit/components/FolderDeleteModal.test.jsx tests/unit/components/BinConfirmModals.test.jsx` (PASS)
  - `npx tsc --noEmit` (PASS)
  - `get_errors` on touched files (clean)

## Implementation Progress - Block D (2026-04-05)
- Admin-facing modal migration completed:
  - [src/components/modals/SudoModal.tsx](src/components/modals/SudoModal.tsx) now uses [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx).
- Preserved security flow semantics:
  - reauthentication logic unchanged,
  - close remains blocked while submit is in progress,
  - existing cancel/close reset behavior preserved.
- Validation evidence:
  - `npm run test:unit -- tests/unit/components/SudoModal.test.jsx tests/unit/components/BaseModal.test.jsx tests/unit/components/FolderDeleteModal.test.jsx tests/unit/components/BinConfirmModals.test.jsx` (PASS)
  - `npx tsc --noEmit` (PASS)
  - `get_errors` on touched files (clean)

## Implementation Progress - Block E (2026-04-05)
- Additional form-heavy modal migrated to shared shell and close-guard flow:
  - [src/pages/Subject/modals/SubjectFormModal.tsx](src/pages/Subject/modals/SubjectFormModal.tsx)
- Dirty-state interception expansion:
  - SubjectFormModal now uses [src/utils/modalCloseGuardUtils.ts](src/utils/modalCloseGuardUtils.ts) for close decisions.
  - Backdrop close, header close, and footer cancel now route through the same guarded close request path.
- Validation evidence:
  - `npm run test:unit -- tests/unit/pages/subject/SubjectFormModal.coursePeriodSchedule.test.jsx tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx tests/unit/utils/modalCloseGuardUtils.test.js tests/unit/components/BaseModal.test.jsx` (PASS)
  - `npx tsc --noEmit` (PASS)
  - `get_errors` on touched files (clean)

## Implementation Progress - Block F (2026-04-05)
- Additional Home modal shell migrations completed:
  - [src/pages/Home/modals/SubjectModal.tsx](src/pages/Home/modals/SubjectModal.tsx)
  - [src/pages/Home/modals/EditSubjectModal.tsx](src/pages/Home/modals/EditSubjectModal.tsx)
- Both now use [src/components/ui/BaseModal.tsx](src/components/ui/BaseModal.tsx) while preserving existing create/edit form behavior.
- Regression tests added for migrated Home subject modals:
  - [tests/unit/pages/home/HomeSubjectModals.test.jsx](tests/unit/pages/home/HomeSubjectModals.test.jsx)
- Validation evidence:
  - `npm run test:unit -- tests/unit/pages/home/HomeSubjectModals.test.jsx tests/unit/components/BaseModal.test.jsx tests/unit/pages/subject/SubjectFormModal.coursePeriodSchedule.test.jsx tests/unit/pages/subject/SubjectFormModal.classesLoadError.test.jsx` (PASS)
  - `npx tsc --noEmit` (PASS)
  - `get_errors` on touched files (clean)

## Residual Follow-ups for Later Phases
- Expand shared modal adoption to remaining admin/form-heavy modal surfaces.
- Expand dirty-state interception to remaining modal forms beyond FolderManager and SubjectFormModal.
- Run broader validation pass (lint/typecheck + targeted modal regressions) before Phase 01 closure.

## User-Update Carry-Over (2026-04-05)
- Reopened follow-up A (scrollbar behavior refinement):
  - ensure right-edge scrollbar zone blends with page surface,
  - apply overlay-first scrollbar behavior where supported,
  - preserve no-layout-jump fallback where overlay behavior is unavailable.
- Reopened follow-up B (overlay scope correction):
  - analyze non-modal overlay surfaces across pages (not only classic modal wrappers),
  - prepare a shared header-to-bottom overlay shell migration queue for maintainability.

## Post-Closure Follow-up Progress (2026-04-05)
- Follow-up A completed:
  - [src/components/ui/CustomScrollbar.tsx](src/components/ui/CustomScrollbar.tsx) now detects overlay scrollbar capability and applies explicit mode classes.
  - [src/index.css](src/index.css) now uses overlay-first behavior when supported and a stable fallback mode when not supported.
  - Added focused regression tests in [tests/unit/components/CustomScrollbar.test.jsx](tests/unit/components/CustomScrollbar.test.jsx).
  - Validation evidence:
    - `npm run test -- tests/unit/components/CustomScrollbar.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)
- Follow-up B next:
  - deep non-modal overlay audit completed in [working/non-modal-overlay-audit-2026-04-05.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/non-modal-overlay-audit-2026-04-05.md),
  - first shared-shell migration slice completed with:
    - [src/components/ui/DashboardOverlayShell.tsx](src/components/ui/DashboardOverlayShell.tsx),
    - [src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx](src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx),
    - [src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx](src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx),
    - [src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.tsx](src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.tsx).
  - Validation evidence:
    - `npm run test -- tests/unit/components/DashboardOverlayShell.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.jsx tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)
- Follow-up B slice 2 completed:
  - generalized overlay shell expanded with reusable close-request API, configurable width/height constraints, and built-in unsaved-close confirmation in [src/components/ui/DashboardOverlayShell.tsx](src/components/ui/DashboardOverlayShell.tsx),
  - create/edit overlay flows migrated to shared shell patterns for maintainability:
    - [src/pages/Home/modals/SubjectModal.tsx](src/pages/Home/modals/SubjectModal.tsx),
    - [src/pages/Home/modals/EditSubjectModal.tsx](src/pages/Home/modals/EditSubjectModal.tsx),
    - [src/pages/InstitutionAdminDashboard/components/AddTeacherModal.tsx](src/pages/InstitutionAdminDashboard/components/AddTeacherModal.tsx),
    - [src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx](src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx),
    - [src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx](src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx),
    - [src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx](src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx).
  - Validation evidence:
    - `npm run test -- tests/unit/components/DashboardOverlayShell.test.jsx tests/unit/pages/home/HomeSubjectModals.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx` (PASS)
    - `npm run lint` (PASS)
    - `npx tsc --noEmit` (PASS)

## Phase 01 Closure Summary (2026-04-05)
- Shared modal foundation established and reused across Home, Subject, and admin-facing modal surfaces.
- Dirty-state close interception path implemented in reusable utility and adopted in multiple form-heavy flows.
- Scrollbar left-side compensation artifact removed.
- Validation closure evidence:
  - `npm run lint` (PASS)
  - `npx tsc --noEmit` (PASS)
  - `npm run test` (PASS: 138 files, 621 tests)
- Phase 02 handoff: selection mode and Bin unification can proceed with Phase 01 foundation stable.

## Validation Gate
- Unit coverage for new modal close and dirty-state interception behavior.
- Visual smoke verification for major modal surfaces (Home and Institution Admin).
- No layout shift regressions when scrollbar appears/disappears.
- Lint/typecheck pass for touched modules.

## Exit Criteria
- Shared modal foundation is production-safe and adopted by prioritized overlays.
