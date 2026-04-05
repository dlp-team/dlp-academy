<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-preview-parity-block-c-slice-3-topic-resource-bin-tests.md -->
# Lossless Report - Phase 04 Preview Parity Block C Slice 3 Topic-Resource-Bin Tests

## 1. Requested Scope
- Continue Phase 04 Block C by strengthening deterministic parity coverage for topic/resource/bin composition transitions in customization preview.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No source runtime changes to preview UI components in this slice.
- No changes to settings save/apply behavior.
- No changes to fullscreen overlay behavior.

## 3. Touched Files
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)

## 4. Per-File Verification
- Extended tab-flow assertions in existing preview drilldown test to verify:
  - bin simulated content and actions (`Tecnología`, `Restaurar`, `Eliminar`),
  - subject-detail navigation control (`Volver a asignaturas`),
  - return-to-list behavior after topic resource drilldown (`Mis Asignaturas`).
- Preserved prior assertions for shared/manual drilldown behavior.

## 5. Risks and Checks
- Risk: tab-button visibility variance can make assertions flaky.
  - Check: retained tested path already proven stable in existing suite and used deterministic content assertions after tab switches.
- Risk: overfitting test text to incidental wording.
  - Check: assertions target stable product-language labels already used across the preview surface.

## 6. Validation Summary
- Targeted tests:
  - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
- Diagnostics:
  - `get_errors` for touched test file -> No errors found.
