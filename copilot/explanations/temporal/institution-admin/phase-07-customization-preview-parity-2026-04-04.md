<!-- copilot/explanations/temporal/institution-admin/phase-07-customization-preview-parity-2026-04-04.md -->
# Phase 07 Customization Preview Parity (2026-04-04)

## Scope
Deliver Phase 07: fix fullscreen preview black-screen behavior and improve preview resource parity for subject/topic drilldown.

## Before
- Fullscreen mode in [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx) used a fixed overlay class without explicit flex-stage layout dimensions, which could stack panel/preview sections off-screen in overlay mode.
- Topic resource mock data in [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx) did not include files as a first-class resource and still exposed mixed-language labels in some entries.

## After
- Fullscreen preview root now enforces `fixed + flex + h-screen + w-screen + overflow-hidden` and adds a deterministic test id in [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx).
- Added fullscreen body scroll lock with cleanup restore-on-exit in [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx).
- Added `file` resource type (`Archivos`) and localized resource labels (`Cuestionarios`, `Materiales`) in [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx).
- Added deterministic coverage for fullscreen layout, keyboard exit, and files-resource drilldown in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).

## Validation
- Passed: `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`
- Executed: `npm run test:e2e -- tests/e2e/branding.spec.js` (environment gate skip, no runtime failure)
- Passed: `get_errors` clean on touched files.

## Notes
- No backend, rules, or persistent data model changes were made in this phase.
- Changes remain isolated to institution customization preview surface and associated tests/docs.
