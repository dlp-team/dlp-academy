<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/user-update-overlay-shell-audit-and-slice-1.md -->
# Lossless Report - User Update Overlay Shell Audit and Slice 1

## 1. Requested Scope
- Execute deep analysis of non-modal overlays across pages.
- Start unification by migrating a low-risk first slice to a shared header-to-bottom overlay shell.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No changes to backend functions, rules, or permissions.
- No changes to Institution Admin business logic in transfer/import/course/class workflows.
- No changes to customization preview behavior in this block.

## 3. Touched Files
- [src/components/ui/DashboardOverlayShell.tsx](src/components/ui/DashboardOverlayShell.tsx)
- [src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx](src/pages/InstitutionAdminDashboard/components/classes-courses/Shared.tsx)
- [src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx](src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx)
- [src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.tsx](src/pages/InstitutionAdminDashboard/components/CsvImportWorkflowModal.tsx)
- [tests/unit/components/DashboardOverlayShell.test.jsx](tests/unit/components/DashboardOverlayShell.test.jsx)
- [copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/non-modal-overlay-audit-2026-04-05.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/non-modal-overlay-audit-2026-04-05.md)

## 4. Per-File Verification
- `DashboardOverlayShell.tsx`
  - Introduced shared overlay shell using `BaseModal` with top-constrained wrapper and width presets.
- `Shared.tsx`
  - Replaced local `Modal` overlay wrapper internals with `DashboardOverlayShell` while keeping external API intact.
- `TransferPromotionDryRunModal.tsx`
  - Replaced inline overlay/backdrop wrapper with shared shell; kept dry-run/apply/rollback logic unchanged.
- `CsvImportWorkflowModal.tsx`
  - Replaced inline overlay/backdrop wrapper with shared shell; kept import source/mapping/mode logic unchanged.
- `DashboardOverlayShell.test.jsx`
  - Added deterministic tests for close behavior, close blocking, and shell layout contract.
- `non-modal-overlay-audit-2026-04-05.md`
  - Recorded prioritized overlay inventory, migration readiness notes, and next migration queue.

## 5. Risks and Checks
- Risk: shell migration could alter close behavior.
  - Check: backdrop close path remains explicit and tested.
- Risk: shell migration could regress modal width/layout.
  - Check: width preset and top-wrapper contract asserted in new unit tests.
- Risk: workflow components might break through wrapper extraction.
  - Check: targeted Institution Admin workflow tests passed (course/class modal behavior and transfer/csv integration wiring).

## 6. Validation Summary
- Targeted tests:
  - `npm run test -- tests/unit/components/DashboardOverlayShell.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx tests/unit/pages/institution-admin/CreateCourseModal.academicYear.test.jsx tests/unit/pages/institution-admin/CreateClassModal.academicYear.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.transferPromotionDryRun.test.jsx tests/unit/pages/institution-admin/ClassesCoursesSection.courseCsvWorkflow.test.jsx tests/unit/pages/institution-admin/UsersTabContent.bulkCourseCsv.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
- Diagnostics:
  - `get_errors` for touched source/test files -> No errors found.
