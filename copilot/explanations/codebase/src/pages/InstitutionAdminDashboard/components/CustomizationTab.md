# CustomizationTab.jsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/CustomizationTab.jsx`
- **Last documented:** 2026-03-30
- **Role:** Institution customization tab orchestrator for branding upload + theme editing.

## Responsibilities
- Displays global success/error/saving banners for customization actions.
- Connects `BrandingSection` palette extraction to preview editor through `previewPaletteApply`.
- Hosts the customization editor panel with role-mock preview rendering.

## Exports
- `default CustomizationTab`

## Main Dependencies
- `react`
- `lucide-react`
- `./customization/BrandingSection`
- `./InstitutionCustomizationMockView`

## Changelog
### 2026-03-30
- Switched from iframe-based live preview to role-based mock preview component.
- Preserved existing palette suggestion bridge (`previewPaletteApply`) without auto-save behavior.
