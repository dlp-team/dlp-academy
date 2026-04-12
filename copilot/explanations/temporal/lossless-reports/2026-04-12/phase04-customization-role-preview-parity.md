<!-- copilot/explanations/temporal/lossless-reports/2026-04-12/phase04-customization-role-preview-parity.md -->
# Lossless Report - Phase 04 Customization Role Preview Parity

## Requested Scope
- Continue plan execution with Institution Admin customization preview parity:
  - remove internal teacher selector pressure while keeping top-level role switch,
  - provide dedicated mock role previews,
  - avoid Home fallback dependency for role switching,
  - ensure swatch opens color picker in active/inactive states,
  - keep live preview updates local until explicit save.

## Implemented
1. Set customization tab preview path to explicit mock mode in `CustomizationTab`.
2. Expanded `InstitutionCustomizationMockView` role switching to `admin` + `teacher` + `student` and updated role labels.
3. Added dedicated admin dashboard mock surface in `CustomizationHomeExactPreview` while preserving teacher/student Home-exact preview flow.
4. Extended `CustomizationPreviewHeader` role semantics for admin subtitle/action/avatar parity.
5. Hardened `ColorField` active-state swatch interaction by disabling pointer interception from ping overlay.
6. Added/updated focused tests for role switching, admin mock surface, header admin rendering, and active-state swatch picker behavior.

## Preserved Behaviors
- Teacher/student exact Home preview controls and drilldown behavior remain intact.
- Live mode contract (`previewMode='live'`) and postMessage payload tests remain passing.
- Save/reset confirmation, theme-set save/apply, fullscreen, and viewport behavior remain unchanged.
- Customization persistence still occurs only via explicit save actions.

## Touched Files
- `src/pages/InstitutionAdminDashboard/components/CustomizationTab.tsx`
- `src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx`
- `src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx`
- `src/pages/InstitutionAdminDashboard/components/customization/CustomizationPreviewHeader.tsx`
- `src/pages/InstitutionAdminDashboard/components/customization/ColorField.tsx`
- `tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`
- `tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx`
- `tests/unit/pages/institution-admin/ColorField.test.jsx`

## File-by-File Verification
- `CustomizationTab.tsx`
  - Preview shell now runs in explicit mock mode to guarantee dedicated role surfaces.
- `InstitutionCustomizationMockView.tsx`
  - Added admin role support in top-level switch and role labeling.
  - Default preview mode now mock, preserving optional live mode.
- `CustomizationHomeExactPreview.tsx`
  - Added admin-specific mock dashboard renderer and role branch.
  - Kept teacher/student branch untouched for Home-exact parity.
- `CustomizationPreviewHeader.tsx`
  - Added admin subtitle/action chip/avatar initial handling.
- `ColorField.tsx`
  - Active ping overlay no longer blocks pointer events.
- `InstitutionCustomizationMockView.test.jsx`
  - Added admin role switch assertions and dedicated admin-surface check.
- `CustomizationPreviewHeader.test.jsx`
  - Added admin parity assertions.
- `ColorField.test.jsx`
  - Added active-state swatch picker regression coverage.

## Validation Summary
- `get_errors` clean on touched source and test files.
- Focused tests passed:
  - `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx tests/unit/pages/institution-admin/CustomizationPreviewHeader.test.jsx tests/unit/pages/institution-admin/ColorField.test.jsx tests/unit/pages/theme-preview/ThemePreview.test.jsx`

## Next Phase
- Phase 05: Global scrollbar stabilization and theme-live parity checks.
