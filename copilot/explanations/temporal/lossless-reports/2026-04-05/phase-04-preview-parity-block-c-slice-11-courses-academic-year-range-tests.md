<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-preview-parity-block-c-slice-11-courses-academic-year-range-tests.md -->
# Lossless Report - Phase 04 Block C Slice 11 (Cursos Academic-Year Range Parity)

## 1. Requested Scope
- Continue active plan execution with the next deterministic customization preview parity slice.
- Harden `Cursos` mode parity for academic-year range filtering behavior.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No production runtime logic changes.
- No backend/rules/data changes.
- No UI redesign changes.
- No modal/overlay behavior changes.

## 3. Touched Files
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
- [copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md)
- [copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-04-customization-preview-parity.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-04-customization-preview-parity.md)
- [copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md](copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md)

## 4. Per-File Verification
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Added parity test for `Año académico` range filter in `Cursos` mode.
  - Asserts pre-filter baseline contains `2024-2025` wrappers.
  - Opens academic-year filter panel and selects `2025-2026`.
  - Asserts out-of-range `2024-2025` wrappers are removed and in-range `2025-2026` wrappers remain visible.

## 5. Risks and Checks
- Risk: role-query collisions between filter-panel year buttons and course wrappers.
  - Check: selected year is scoped within the filter panel.
- Risk: filter-panel buttons polluting post-filter assertions.
  - Check: filter panel is closed before asserting page-level wrappers.

## 6. Validation Summary
- Diagnostics:
  - `get_errors` clean for touched test file.
- Targeted regression tests:
  - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static gates:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
