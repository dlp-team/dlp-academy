<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-preview-parity-block-c-slice-10-courses-current-filter-tests.md -->
# Lossless Report - Phase 04 Block C Slice 10 (Cursos Current-Filter Parity)

## 1. Requested Scope
- Continue active plan execution after the subject-create regression fix.
- Advance Phase 04 Block C with another deterministic preview-parity hardening slice.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No production component logic changes.
- No Firestore/data-layer changes.
- No UI copy or theme behavior changes.
- No modal/overlay behavior changes in this block.

## 3. Touched Files
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md)
- [copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/phases/phase-04-customization-preview-parity.md](copilot/plans/finished/home-bin-institution-admin-unification-2026-04-05/phases/phase-04-customization-preview-parity.md)
- [copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md](copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md)

## 4. Per-File Verification
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Added regression test for `Cursos` mode current-subject filter behavior.
  - Asserts baseline presence of historical and current academic-year wrappers.
  - Asserts historical academic-year wrapper is removed after toggling current-subject filter, while current-year wrappers remain visible.

## 5. Risks and Checks
- Risk: assertion ambiguity due multiple `2025-2026` group buttons.
  - Check: switched to `getAllByRole(...).length > 0` for deterministic multi-match validation.
- Risk: test-only block accidentally broadens runtime behavior.
  - Check: no source runtime files changed in this block.

## 6. Validation Summary
- Diagnostics:
  - `get_errors` clean for touched test file.
- Targeted regression tests:
  - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static gates:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.


