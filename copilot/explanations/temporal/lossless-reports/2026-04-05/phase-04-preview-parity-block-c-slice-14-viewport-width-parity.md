<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-preview-parity-block-c-slice-14-viewport-width-parity.md -->
# Lossless Report - Phase 04 Block C Slice 14 (Viewport Width Parity)

## 1. Requested Scope
- Continue active plan execution with the next deterministic customization preview parity slice.
- Harden responsive parity coverage for desktop/tablet/mobile viewport controls.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No backend/functions/rules/data changes.
- No theme token semantics changes.
- No role or tab behavior changes.
- No modal/overlay migration changes in this block.

## 3. Touched Files
- [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx)
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
- [copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/README.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/README.md)
- [copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md)
- [copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-04-customization-preview-parity.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-04-customization-preview-parity.md)
- [copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/phase-04-preview-parity-kickoff.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/phase-04-preview-parity-kickoff.md)
- [copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/user-updates.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/user-updates.md)
- [copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.md](copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.md)
- [copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md](copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md)

## 4. Per-File Verification
- [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx)
  - Added `data-testid="customization-preview-viewport-frame"` to the frame that receives viewport-width style updates.
  - No behavior logic changes; only deterministic testability hook added.
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Added responsive parity regression test to assert:
    - default desktop width (`100%`),
    - tablet width (`768px`),
    - mobile width (`390px`),
    - return to desktop width (`100%`).

## 5. Risks and Checks
- Risk: brittle selector for viewport frame in tests.
  - Check: introduced explicit stable test hook rather than class-based selector.
- Risk: viewport toggle labels with accent sensitivity.
  - Check: mobile-title query uses accent-safe regex (`/m[oó]vil/i`).

## 6. Validation Summary
- Diagnostics:
  - `get_errors` clean for touched source and test files.
- Targeted regression tests:
  - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static gates:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
