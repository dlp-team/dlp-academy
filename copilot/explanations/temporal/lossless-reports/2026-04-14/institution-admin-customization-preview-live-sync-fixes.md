# Lossless Report - Institution Admin Customization Preview Live Sync Fixes (2026-04-14)

## Requested Scope
1. Remove the duplicate role selector from inside the preview header (keep top `Vista docente/estudiante` controls as the only source).
2. Fix color-card swatch interaction so picker opens reliably even when the token is active and highlighted.
3. Remove the `activo` badge in color cards to avoid title-row layout movement.
4. Make color changes propagate to preview immediately without saving (save remains explicit).

## Preserved Behaviors
- Explicit save contract remains unchanged: customization is still persisted only through save confirmation.
- Top toolbar role toggle (`Vista docente` / `Vista estudiante`) remains fully functional.
- Existing token focus/blur highlight behavior and card-click selection semantics remain intact.
- Same-origin message boundary checks in preview messaging remain unchanged.

## Touched Files
- [src/pages/InstitutionAdminDashboard/components/customization/ColorField.tsx](src/pages/InstitutionAdminDashboard/components/customization/ColorField.tsx)
- [src/pages/ThemePreview/ThemePreview.tsx](src/pages/ThemePreview/ThemePreview.tsx)
- [tests/unit/pages/institution-admin/ColorField.test.jsx](tests/unit/pages/institution-admin/ColorField.test.jsx)
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
- [tests/unit/pages/theme-preview/ThemePreview.test.jsx](tests/unit/pages/theme-preview/ThemePreview.test.jsx)
- [copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/customization/ColorField.md](copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/customization/ColorField.md)
- [copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.md](copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.md)
- [copilot/explanations/codebase/src/pages/ThemePreview/ThemePreview.md](copilot/explanations/codebase/src/pages/ThemePreview/ThemePreview.md)
- [copilot/explanations/codebase/tests/unit/pages/institution-admin/ColorField.test.md](copilot/explanations/codebase/tests/unit/pages/institution-admin/ColorField.test.md)
- [copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md](copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md)
- [copilot/explanations/codebase/tests/unit/pages/theme-preview/ThemePreview.test.md](copilot/explanations/codebase/tests/unit/pages/theme-preview/ThemePreview.test.md)

## File-by-File Verification
### [src/pages/InstitutionAdminDashboard/components/customization/ColorField.tsx](src/pages/InstitutionAdminDashboard/components/customization/ColorField.tsx)
- Added `data-color-field-active` for stable active-state assertions.
- Added `pointer-events-none` to active ping overlay so swatch clicks are not blocked when active.
- Removed inline `activo` badge to eliminate title-row jitter.
- Added native color input `onInput` + `onChange` handlers to propagate color updates in real time.
- Added safe `showPicker` fallback path to `click()` when picker API is unavailable/blocked.

### [src/pages/ThemePreview/ThemePreview.tsx](src/pages/ThemePreview/ThemePreview.tsx)
- Locked resolved preview-user `roles` and `availableRoles` to the selected preview role.
- This removes duplicate in-iframe role switching while preserving top-toolbar role control.

### [tests/unit/pages/institution-admin/ColorField.test.jsx](tests/unit/pages/institution-admin/ColorField.test.jsx)
- Added regression test for active-state swatch click opening native picker.

### [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
- Replaced `activo` text assertions with `data-color-field-active` state assertions.
- Added live-preview regression test verifying native color `input` events update iframe payload immediately without save.

### [tests/unit/pages/theme-preview/ThemePreview.test.jsx](tests/unit/pages/theme-preview/ThemePreview.test.jsx)
- Added role metadata assertions to verify preview-role lock behavior (`roles` / `availableRoles`).

## Validation Summary
- `get_errors` on all touched source/test files: no errors.
- Targeted unit test run passed:
  - Command: `npm run test:unit -- tests/unit/pages/institution-admin/ColorField.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx tests/unit/pages/theme-preview/ThemePreview.test.jsx`
  - Result: 3 test files passed, 33 tests passed.

## Lossless Outcome
- Requested UX fixes are implemented.
- No unrelated behavior was modified.
- Save/persist boundaries remain unchanged.
