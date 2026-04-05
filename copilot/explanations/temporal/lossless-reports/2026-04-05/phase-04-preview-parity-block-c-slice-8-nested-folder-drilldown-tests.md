<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-preview-parity-block-c-slice-8-nested-folder-drilldown-tests.md -->
# Lossless Report - Phase 04 Preview Parity Block C Slice 8 Nested Folder Drilldown Tests

## 1. Requested Scope
- Continue Block C parity hardening with deterministic nested-folder navigation and drilldown assertions in customization preview tests.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No runtime source changes in this slice.
- No changes to preview data fixtures, Home component wiring, or overlay behavior.
- No changes to existing bin/shared/usage drilldown test paths.

## 3. Touched Files
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)

## 4. Per-File Verification
- Added deterministic path that:
  - opens parent folder `Planificación semanal`,
  - drills into nested child folder `Laboratorio`,
  - selects `Ciencias` from nested context,
  - verifies topic detail panel visibility (`Temas de la asignatura`) and back-navigation control presence.

## 5. Risks and Checks
- Risk: folder-card click targets may be fragile if card text structure changes.
  - Check: assertions target fixture labels that are stable and shared with existing preview composition.
- Risk: nested-folder assertions could pass from root content if traversal did not happen.
  - Check: test validates child-folder marker `Laboratorio` before selecting nested subject.

## 6. Validation Summary
- Targeted tests:
  - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
- Diagnostics:
  - `get_errors` for touched test file -> No errors found.
