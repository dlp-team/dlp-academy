<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-preview-parity-block-c-slice-12-student-shared-fallback.md -->
# Lossless Report - Phase 04 Block C Slice 12 (Student Shared-Tab Fallback Parity)

## 1. Requested Scope
- Continue active plan execution with the next deterministic customization preview parity slice.
- Harden role-transition parity so shared-only preview surfaces do not persist when switching to student role.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No backend/functions/rules changes.
- No production data-shape or persistence behavior changes.
- No modal/overlay migration changes in this block.
- No UI redesign changes outside the targeted preview transition guard.

## 3. Touched Files
- [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx)
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/README.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/README.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/phases/phase-04-customization-preview-parity.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/phases/phase-04-customization-preview-parity.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/phase-04-preview-parity-kickoff.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/working/phase-04-preview-parity-kickoff.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/user-updates.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/user-updates.md)
- [copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.md](copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.md)
- [copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md](copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md)

## 4. Per-File Verification
- [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx)
  - Added a role-transition guard effect to force `viewMode` from `shared` to `grid` whenever preview role is student.
  - Verified existing view-mode reset effect still preserves folder/detail cleanup semantics.
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Added deterministic regression test for shared-to-student transition:
    - starts in `Compartido`,
    - switches to `Vista estudiante`,
    - verifies shared heading/tab disappear,
    - verifies manual view content (`Mis Asignaturas`) is rendered.

## 5. Risks and Checks
- Risk: unintended view reset for non-shared modes on role switch.
  - Check: guard condition only mutates state when `isStudentRole && viewMode === 'shared'`.
- Risk: flaky test due asynchronous state updates.
  - Check: assertions scoped in `waitFor` after role toggle.

## 6. Validation Summary
- Diagnostics:
  - `get_errors` clean for touched source and test files.
- Targeted regression tests:
  - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static gates:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.


