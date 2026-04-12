<!-- copilot/plans/active/autopilot-plan-scrollbar-execution-2026-04-12/phases/phase-04-customization-preview-parity.md -->
# Phase 04 - Customization Preview Parity

## Objective
Align Institution Admin customization preview behavior with requested role-view and live-color parity.

## Scope
- Remove the internal teacher selector from preview header (keep top-level role switch).
- Add independent mock preview datasets/views for admin, teacher, and student.
- Ensure preview role switch navigates to dedicated mock dashboard surfaces (not Home fallback).
- Fix color swatch interaction so picker opens from swatch card in active and inactive states.
- Apply live preview color updates immediately, with persistence only on explicit save.

## Primary File Surfaces
- `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.tsx`
- `src/pages/InstitutionAdminDashboard/components/CustomizationTab.tsx`
- `src/pages/InstitutionAdminDashboard/components/customization/ColorField.tsx`
- `src/pages/InstitutionAdminDashboard/hooks/useCustomization.ts`

## Acceptance Criteria
- Role previews are independent and stable.
- Color picker and live preview behavior are consistent and non-destructive until save.

## Validation
- Targeted customization tests.
- Manual verification across desktop/tablet/mobile preview shells.