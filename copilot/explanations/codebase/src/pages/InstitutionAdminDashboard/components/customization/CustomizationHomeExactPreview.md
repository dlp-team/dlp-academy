# CustomizationHomeExactPreview.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx`
- **Last documented:** 2026-04-02
- **Role:** Exact customization preview adapter that reuses Home page UI components with isolated deterministic mock data.

## Responsibilities
- Builds live Home theme CSS variables from customization form colors.
- Renders Home preview with role-aware mock context (`docente` / `estudiante`) and viewport width simulation.
- Reuses `HomeControls` and `HomeContent` directly instead of bespoke mock cards.
- Keeps preview deterministic and backend-isolated by using local static mock folders/subjects and no-op handlers.

## Exports
- `default CustomizationHomeExactPreview`

## Main Dependencies
- `react`
- `src/pages/Home/components/HomeControls`
- `src/pages/Home/components/HomeContent`
- `src/utils/themeTokens`
- `src/pages/InstitutionAdminDashboard/components/customization/themePreviewUtils`

## Changelog
### 2026-04-02
- Added exact-preview adapter to implement Home-surface reuse strategy from Phase 04.
- Added isolated mock-data provider and role-aware preview behavior for deterministic parity checks.
