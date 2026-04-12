<!-- copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/customization/CustomizationPreviewHeader.md -->
# CustomizationPreviewHeader.tsx

## Overview
- **Source file:** `src/pages/InstitutionAdminDashboard/components/customization/CustomizationPreviewHeader.tsx`
- **Last documented:** 2026-04-05
- **Role:** Shared preview header shell that mirrors key identity/navigation affordances from the Home header in customization preview mode.

## Responsibilities
- Render institution identity with icon, title, and role-specific subtitle.
- Expose a compact top action chip (`Inicio` / `Administración`) to emulate role-aware header navigation context.
- Render role-aware theme toggle icon and avatar indicator for deterministic preview parity.
- Apply color-token reflection through the primary color prop without coupling to backend state.

## Exports
- `default CustomizationPreviewHeader`

## Main Dependencies
- `react`
- `lucide-react`

## Props
- `institutionName`: visible identity label; fallback `Tu Institución`.
- `previewRole`: determines subtitle and icon/avatar state (`admin`, `student`, and teacher-like roles).
- `primaryColor`: drives icon badge and avatar fill color in preview.

## Changelog
### 2026-04-12
- Added explicit admin parity state (`Panel de administración`) including role-specific avatar marker (`A`) and action-chip label (`Administración`).

### 2026-04-05
- Added new header parity component for Phase 04 Block B and integrated it into exact Home preview composition.
