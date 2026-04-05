<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-preview-parity-block-c-slice-7-shared-drilldown-tests.md -->
# Lossless Report - Phase 04 Preview Parity Block C Slice 7 Shared Drilldown Tests

## 1. Requested Scope
- Continue Block C parity hardening with deterministic shared-tab topic/resource drilldown assertions in customization preview tests.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No runtime source changes in this slice.
- No changes to preview shell composition, fullscreen layering, or theming behavior.
- No changes to non-modal overlay-shell migration components.

## 3. Touched Files
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)

## 4. Per-File Verification
- Added deterministic path that:
  - switches preview into `Compartido` mode,
  - selects shared subject `Geografía compartida`,
  - drills into shared topic `Cartografía básica`,
  - verifies resource panel output (`Guías de estudio`),
  - returns with `Volver a asignaturas` and revalidates shared-list heading.

## 5. Risks and Checks
- Risk: shared-card interaction selectors may drift if card semantics change.
  - Check: assertions anchor on existing visible labels already used in preview fixtures.
- Risk: resource assertion may pass from unrelated sections.
  - Check: resource assertion runs only after topic panel marker (`Temas de la asignatura`) and topic selection.

## 6. Validation Summary
- Targeted tests:
  - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
- Diagnostics:
  - `get_errors` for touched test file -> No errors found.
