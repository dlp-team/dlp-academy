<!-- copilot/explanations/codebase/src/pages/ThemePreview/ThemePreview.md -->
# ThemePreview.tsx

## Overview
- **Source file:** `src/pages/ThemePreview/ThemePreview.tsx`
- **Last documented:** 2026-04-08
- **Role:** Public, auth-independent route that renders Home mock preview and consumes live customization updates via `postMessage`.

## Responsibilities
- Resolves initial preview role from URL query (`/theme-preview?role=teacher|student`).
- Listens for institution-preview messages and ignores foreign origins.
- Applies incoming unsaved color updates to preview state without persistence.
- Applies runtime theme/highlight CSS payloads for live visual parity.
- Renders `CustomizationHomeExactPreview` with route-local role/color/active-token state.

## Main Dependencies
- `react`
- `react-router-dom`
- `src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx`
- `src/pages/InstitutionAdminDashboard/components/customization/themePreviewUtils.ts`
- `src/utils/institutionPreviewProtocol.ts`

## Changelog
### 2026-04-08
- Added new public `ThemePreview` page for iframe-based institution customization preview.
- Added secure same-origin message listener for preview payload updates.
- Added query-role bootstrap support and live role/color synchronization.
