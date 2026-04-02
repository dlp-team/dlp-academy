# CustomizationTab.jsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/CustomizationTab.jsx`
- **Last documented:** 2026-04-02
- **Role:** Institution customization tab orchestrator for branding upload + theme editing.

## Responsibilities
- Displays global success/error/saving banners for customization actions.
- Connects `BrandingSection` palette extraction to preview editor through `previewPaletteApply`.
- Hosts the customization editor panel whose preview now reuses Home UI components via the exact-preview adapter.

## Exports
- `default CustomizationTab`

## Main Dependencies
- `react`
- `lucide-react`
- `./customization/BrandingSection`
- `./InstitutionCustomizationMockView`

## Changelog
### 2026-04-02
- Retained palette suggestion bridge and editor wiring while preview internals moved to exact Home-surface rendering in `InstitutionCustomizationMockView`.

### 2026-03-30
- Switched from iframe-based live preview to role-based mock preview component.
- Preserved existing palette suggestion bridge (`previewPaletteApply`) without auto-save behavior.
