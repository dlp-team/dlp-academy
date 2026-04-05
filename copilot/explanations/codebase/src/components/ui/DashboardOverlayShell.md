<!-- copilot/explanations/codebase/src/components/ui/DashboardOverlayShell.md -->
# DashboardOverlayShell.tsx

## Overview
- **Source file:** `src/components/ui/DashboardOverlayShell.tsx`
- **Last documented:** 2026-04-05
- **Role:** Shared non-modal overlay shell for dashboard-style create/edit/import surfaces, constrained between header and bottom viewport bounds.

## Responsibilities
- Reuse `BaseModal` while standardizing dashboard overlay defaults.
- Provide overlay-width presets (`sm` to `3xl`) with consistent card styling.
- Enforce constrained overlay viewport between app header and screen bottom using shared top offset constants.
- Centralize width/height behavior via shell-level presets and `maxHeightClassName` customization.
- Provide optional dirty-close confirmation flow for backdrop/close-button exits when unsaved changes are present.
- Expose a render-prop `requestClose` helper so child overlays can route all dismiss actions through one guarded path.

## Exports
- `default DashboardOverlayShell`

## Main Dependencies
- `react`
- `src/components/ui/BaseModal`

## Changelog
### 2026-04-05
- Added shared overlay shell for Institution Admin non-modal overlay unification slice 1.
- Expanded shell into generalized create/edit overlay primitive with header-to-bottom bounds, unsaved-close confirmation, and render-prop close requests.
