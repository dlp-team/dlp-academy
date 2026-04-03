# InstitutionCustomizationMockView.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx`
- **Last documented:** 2026-04-02
- **Role:** Theme editor shell that orchestrates exact Home-surface preview for teacher and student perspectives.

## Responsibilities
- Maintains editable customization form with safe color normalization.
- Applies palette suggestions from branding extraction (`previewPaletteApply`) in preview-only mode.
- Provides role toggle (`docente` / `estudiante`) and viewport toggle (`desktop` / `tablet` / `móvil`).
- Delegates preview rendering to `CustomizationHomeExactPreview` to reuse Home components (`HomeControls`, `HomeContent`) with isolated mock data.
- Persists final customization payload only when save action is explicitly triggered.

## Exports
- `default InstitutionCustomizationMockView`

## Main Dependencies
- `react`
- `lucide-react`
- `./customization/ColorField`
- `./customization/themePreviewUtils`
- `./customization/CustomizationHomeExactPreview`

## Changelog
### 2026-04-03
- Added fullscreen preview mode with keyboard `Esc` exit and explicit UI toggle.
- Added collapsible controls sidebar with compact collapsed-state save/reset actions.
- Preserved preview-safe persistence semantics: form updates remain local until explicit save.

### 2026-04-02
- Replaced static mock cards with exact Home-surface preview composition while preserving editor flow and explicit save behavior.
- Kept role/viewport toggles and live palette injection semantics unchanged.

### 2026-03-30
- Added new mock-based customization preview component to replace fragile iframe dependency.
- Added dedicated teacher/student preview cards with token-driven visual feedback.
- Added save/reset controls and active-token highlighting in mock preview.
