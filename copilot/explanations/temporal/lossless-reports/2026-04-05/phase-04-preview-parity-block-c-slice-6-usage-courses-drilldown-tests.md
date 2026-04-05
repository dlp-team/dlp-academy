<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-preview-parity-block-c-slice-6-usage-courses-drilldown-tests.md -->
# Lossless Report - Phase 04 Preview Parity Block C Slice 6 Usage/Cursos Drilldown Tests

## 1. Requested Scope
- Continue Block C parity hardening with deterministic cross-tab topic drilldown assertions in customization preview tests.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No runtime source changes in this slice.
- No changes to preview rendering logic, state persistence, permissions, or fullscreen behavior.
- No changes to overlay shell migration implementation from prior user-update block.

## 3. Touched Files
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)

## 4. Per-File Verification
- Added deterministic path that:
  - drills into subject topics from `Uso` tab,
  - returns to subject list,
  - switches to `Cursos` tab,
  - expands year wrapper and course wrapper,
  - drills into a course subject and verifies topic panel visibility.
- Updated test interaction targets to stable, rendered UI paths in courses mode (collapsed wrappers are expanded before selecting subjects).

## 5. Risks and Checks
- Risk: brittle assertions when course grouping wrappers are collapsed by default.
  - Check: test explicitly opens year and course wrappers before subject selection.
- Risk: accessibility-role mismatch for subject cards across tabs.
  - Check: subject selection uses visible label text, matching existing stable drilldown pattern in this suite.

## 6. Validation Summary
- Targeted tests:
  - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
- Diagnostics:
  - `get_errors` for touched test file -> No errors found.
