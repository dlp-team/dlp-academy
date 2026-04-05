<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-preview-parity-block-c-slice-4-bin-layout-mode.md -->
# Lossless Report - Phase 04 Preview Parity Block C Slice 4 Bin Layout Mode

## 1. Requested Scope
- Continue Phase 04 Block C with concrete topic/resource/bin parity hardening.
- Make preview bin honor list/grid mode controls and add deterministic coverage for mode switching.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No changes to customization persistence behavior.
- No changes to transfer/course automation logic.
- No changes to fullscreen overlay contract.

## 3. Touched Files
- [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx)
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)

## 4. Per-File Verification
- `CustomizationHomeExactPreview.tsx`
  - Added `layoutMode`-aware mock bin rendering.
  - Preserved existing grid mode while adding explicit list mode row layout.
  - Added deterministic `data-testid` hooks for preview bin list/grid items to support robust tests.
- `InstitutionCustomizationMockView.test.jsx`
  - Added regression test to verify bin preview reacts to `Lista` and `Cuadrícula` controls.
  - Existing parity assertions for header/content/bin/topic transitions remain passing.

## 5. Risks and Checks
- Risk: adding list rendering path could regress existing grid behavior.
  - Check: test asserts both directions of mode switch (grid -> list -> grid).
- Risk: bin assertions could become flaky by targeting unstable selectors.
  - Check: assertions target deterministic `data-testid` hooks introduced specifically for parity testing.

## 6. Validation Summary
- Targeted tests:
  - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
- Diagnostics:
  - `get_errors` on touched source/test files -> No errors found.
