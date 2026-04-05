<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-preview-parity-block-c-slice-2-integration-tests.md -->
# Lossless Report - Phase 04 Preview Parity Block C Slice 2 Integration Tests

## 1. Requested Scope
- Extend Phase 04 Block C parity validation with integration-level assertions.
- Verify preview header shell and exact Home controls remain aligned under role transitions.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No runtime changes to preview components.
- No changes to fullscreen behavior or z-index contracts.
- No changes to topic/resource/bin logic in this slice.

## 3. Touched Files
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)

## 4. Per-File Verification
- Added deterministic test path asserting preview header shell text (`Panel docente/estudiante`, `Inicio`) and Home controls (`Manual`, `Cursos`) co-render in exact preview.
- Verified parity assertions persist after switching role from docente to estudiante.
- Stabilized control assertions to target consistently visible tab buttons.

## 5. Risks and Checks
- Risk: integration assertions may become brittle due responsive tab overflow.
  - Check: assertions target stable visible controls (`Manual`, `Cursos`) instead of optional overflowed tabs.
- Risk: role-switch check could miss shell-level regressions.
  - Check: assertions include both pre- and post-switch role subtitle checks.

## 6. Validation Summary
- Targeted tests:
  - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
- Diagnostics:
  - `get_errors` for touched test file -> No errors found.
