<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/customization/themePreviewUtils.md -->
# themePreviewUtils.ts

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/customization/themePreviewUtils.ts`
- **Last documented:** 2026-04-07
- **Role:** Shared preview theming utilities for institution customization editor and live iframe integration.

## Responsibilities
- Defines color token metadata and viewport presets.
- Builds CSS variable payloads for theme preview rendering.
- Builds highlight CSS for token-specific affected-region emphasis.
- Exposes helpers for iframe/theme injection and postMessage payload construction.

## Changelog
### 2026-04-07
- Added `buildInstitutionPreviewThemeMessage(...)` for live iframe postMessage dispatch.
- Added highlight-message mapping per token for iframe feedback text.
- Added protocol-driven message envelope (`source`, `type`, `payload`) support.
