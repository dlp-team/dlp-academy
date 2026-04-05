<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-preview-parity-block-c-slice-15-invalid-hex-fallback.md -->
# Lossless Report - Phase 04 Block C Slice 15 (Invalid Hex Fallback Parity)

## 1. Requested Scope
- Continue active plan execution with the next deterministic customization preview parity slice.
- Harden color-input robustness parity for invalid hex-entry handling.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No runtime source-component behavior changes in this slice.
- No backend/functions/rules/data changes.
- No modal/overlay behavior changes.
- No role/tab/viewport behavior changes.

## 3. Touched Files
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
- [copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/README.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/README.md)
- [copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/strategy-roadmap.md)
- [copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-04-customization-preview-parity.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/phases/phase-04-customization-preview-parity.md)
- [copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/phase-04-preview-parity-kickoff.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/phase-04-preview-parity-kickoff.md)
- [copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/user-updates.md](copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/user-updates.md)
- [copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md](copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md)

## 4. Per-File Verification
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
  - Added deterministic test for invalid hex fallback behavior.
  - Test flow:
    - set a valid color (`#123456`) in primary color text input,
    - attempt invalid value (`#zzzzzz`),
    - assert valid value persists and invalid value is not retained.

## 5. Risks and Checks
- Risk: test may falsely pass if selector targets a non-primary color input.
  - Check: test uses the first deterministic color text field in the existing ordered token list.
- Risk: fallback semantics could differ between text and native color inputs.
  - Check: assertion verifies rendered form state, independent of input source.

## 6. Validation Summary
- Diagnostics:
  - `get_errors` clean for touched test file.
- Targeted regression tests:
  - `npm run test -- tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static gates:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
