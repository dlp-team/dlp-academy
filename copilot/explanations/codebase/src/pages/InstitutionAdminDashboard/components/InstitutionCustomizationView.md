<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationView.md -->
# InstitutionCustomizationView.tsx

## Overview
- Source file: `src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationView.tsx`
- Last documented: 2026-04-05
- Role: Legacy iframe-based institution customization preview shell with live theme injection and token highlighting support.

## Responsibilities
- Hosts customization form controls (institution identity + color tokens).
- Injects live CSS variables and token-focused highlights into iframe preview.
- Supports fullscreen preview mode and viewport switching.
- Preserves explicit save semantics (form edits are local until save action).

## Exports
- `default InstitutionCustomizationView`

## Main Dependencies
- `react`
- `lucide-react`
- `./customization/ColorField`
- `./customization/themePreviewUtils`

## Changelog
- 2026-04-05: Raised fullscreen overlay stacking context (`z-[10050]`) so fullscreen preview reliably overlays the global header.
