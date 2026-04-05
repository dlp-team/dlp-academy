<!-- copilot/explanations/temporal/lossless-reports/2026-04-05/phase-04-header-parity-preview-shell-block-b.md -->
# Lossless Report - Phase 04 Header Parity Preview Shell Block B

## 1. Requested Scope
- Continue Phase 04 with preview header parity work after fullscreen overlap fix.
- Replace generic exact-preview title strip with a production-like header shell.
- Preserve current role-aware preview context and responsive behavior.

## 2. Explicitly Preserved Out-of-Scope Behavior
- No changes to customization settings persistence flow.
- No changes to topic/resource/bin data fixtures in exact preview.
- No changes to fullscreen entry/exit interaction introduced in Block A.

## 3. Touched Files
- [src/pages/InstitutionAdminDashboard/components/customization/CustomizationPreviewHeader.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationPreviewHeader.tsx)
- [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx)

## 4. Per-File Verification
- `CustomizationPreviewHeader.tsx`
  - Adds dedicated top-shell structure with institution identity, role subtitle, action chip, theme icon, and avatar indicator.
  - Uses deterministic prop-driven state with safe fallback institution label (`Tu Institución`).
- `CustomizationHomeExactPreview.tsx`
  - Integrates new header component at the top of preview surface.
  - Removes old generic title strip while preserving role selection behavior and Home component reuse.

## 5. Risks and Checks
- Risk: role context text might regress after shell replacement.
  - Check: existing role toggle assertions continue passing in customization preview tests.
- Risk: visual spacing could break Home control/content composition.
  - Check: preview renders with header above controls and no runtime diagnostics.

## 6. Validation Summary
- Targeted test:
  - `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- Static checks:
  - `npm run lint` -> PASS.
  - `npx tsc --noEmit` -> PASS.
- Diagnostics:
  - `get_errors` on touched source files -> No errors found.
