<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.md -->
# InstitutionCustomizationMockView.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx`
- **Last documented:** 2026-04-02
- **Role:** Theme editor shell that orchestrates exact Home-surface preview for teacher and student perspectives.

## Responsibilities
- Maintains editable customization form with safe color normalization.
- Applies palette suggestions from branding extraction (`previewPaletteApply`) in preview-only mode.
- Provides role toggle (`docente` / `estudiante`) and viewport toggle (`desktop` / `tablet` / `móvil`).
- Supports live iframe preview mode with postMessage theme/highlight synchronization.
- Keeps deterministic mock preview mode for deep UI tests and fallback execution.
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
### 2026-04-09
- Added saved-theme-set controls in the editor sidebar:
	- save current palette as a named theme set,
	- list hydrated saved themes,
	- reapply saved colors into the live form without implicit persistence.
- Added inline validation/error feedback for missing theme name and persistence failures.

### 2026-04-08
- Added reset confirmation parity using `DashboardOverlayShell` so both save and reset actions are confirmation-gated.
- Updated live iframe default route source from authenticated Home flow to `/theme-preview?role=teacher`.
- Preserved `previewMode='mock'` deterministic path for deep interaction tests.

### 2026-04-07
- Switched default preview path to live iframe rendering (`previewMode='live'`) with postMessage dispatch for theme CSS, highlight CSS, and role payload.
- Added save confirmation gate using `DashboardOverlayShell` before persisting customization.
- Kept `previewMode='mock'` for deterministic test scenarios and long interaction parity coverage.

### 2026-04-05
- Raised fullscreen overlay stacking context (`z-[10050]`) so the customization preview reliably renders above the global fixed header (`z-[9999]`) without overlap.
- Updated color-field blur handling so active preview zone highlighting is temporary: highlight now clears when focus leaves the active color control.

### 2026-04-04
- Hardened fullscreen mode container to preserve `flex` stage layout in overlay mode, preventing preview panel stacking/blank-screen regressions.
- Added explicit body scroll-lock while fullscreen is active and safe overflow restoration on exit.
- Added stable preview root test identifier for deterministic fullscreen regression assertions in unit coverage.

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
