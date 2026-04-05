<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-preview-parity-block-c-slice-9-usage-current-filter-tests.md -->
# Lossless Report - Phase 04 Preview Parity Block C Slice 9 Usage Current-Filter Tests

## 1. Requested Scope
- Continue Block C parity hardening with deterministic assertions for `Uso` mode current-subject filter behavior in customization preview tests.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No runtime source changes in this slice.
- No changes to preview controls rendering, data fixtures, or view-mode composition.
- No changes to previously added drilldown parity test paths.

## 3. Touched Files
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)

## 4. Per-File Verification
- Added deterministic path that:
  - switches to `Uso` mode,
  - confirms non-current fixture subject (`Historia`) is visible before filtering,
  - activates `Alternar filtro de asignaturas vigentes`,
  - confirms non-current subject is hidden while current subject (`Matemáticas`) remains visible.

## 5. Risks and Checks
- Risk: toggle assertion could accidentally target unrelated filtered views.
  - Check: test explicitly enters `Uso` mode before interacting with filter toggle.
- Risk: label-level assertions may become brittle if fixture names change.
  - Check: assertions rely on stable preview fixture labels already used in adjacent tests.

## 6. Validation Summary
- Targeted tests:
  - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
- Diagnostics:
  - `get_errors` for touched test file -> No errors found.
