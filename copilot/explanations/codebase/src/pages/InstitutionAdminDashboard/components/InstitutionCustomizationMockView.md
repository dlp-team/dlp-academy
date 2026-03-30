# InstitutionCustomizationMockView.jsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.jsx`
- **Last documented:** 2026-03-30
- **Role:** Theme editor with deterministic mock preview for teacher and student perspectives.

## Responsibilities
- Maintains editable customization form with safe color normalization.
- Applies palette suggestions from branding extraction (`previewPaletteApply`) in preview-only mode.
- Provides role toggle (`docente` / `estudiante`) and viewport toggle (`desktop` / `tablet` / `móvil`).
- Persists final customization payload only when save action is explicitly triggered.

## Exports
- `default InstitutionCustomizationMockView`

## Main Dependencies
- `react`
- `lucide-react`
- `./customization/ColorField`
- `./customization/themePreviewUtils`

## Changelog
### 2026-03-30
- Added new mock-based customization preview component to replace fragile iframe dependency.
- Added dedicated teacher/student preview cards with token-driven visual feedback.
- Added save/reset controls and active-token highlighting in mock preview.
