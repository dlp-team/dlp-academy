<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-fullscreen-header-overlap-block-a.md -->
# Lossless Report - Phase 04 Fullscreen Header Overlap Block A

## 1. Requested Scope
- Start Phase 04 with a low-risk fullscreen parity fix in customization preview.
- Remove overlap where global app header remains above fullscreen customization preview.
- Add deterministic regression coverage for fullscreen stacking behavior.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No changes to customization save payload shape or persistence semantics.
- No changes to preview content parity logic (subjects/topics/resources/bin rendering) in this block.
- No changes to header component behavior itself.

## 3. Touched Files
- [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx)
- [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationView.tsx)
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)

## 4. Per-File Verification
- Mock preview fullscreen container now uses a stacking context higher than global header (`z-[10050]` vs header `z-[9999]`).
- Legacy iframe customization view now uses the same elevated fullscreen stacking context for consistency.
- Unit regression now asserts fullscreen root class includes elevated z-index contract.

## 5. Risks and Checks
- Risk: raising fullscreen z-index could obscure unrelated overlays.
  - Check: change scoped only to explicit fullscreen mode in customization views.
- Risk: fullscreen regressions on keyboard exit.
  - Check: existing `Esc` exit behavior test remains passing.

## 6. Validation Summary
- Targeted test:
  - `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
- Diagnostics:
  - `get_errors` for touched source/test files -> No errors found.
