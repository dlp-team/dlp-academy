<!-- copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/customization-preview-parity-subplan.md -->
# Customization Preview Parity Subplan

## Objective
Close Phase 07 by fixing fullscreen preview reliability and improving topic-content parity so customization preview behavior mirrors live Home interactions more closely.

## Scope Slice
- Fix fullscreen stage/layout behavior in [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx).
- Preserve deterministic role/viewport switching and keyboard escape exit in the same component.
- Expand mock topic resource parity in [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx) to include explicit files content.
- Extend unit regression coverage in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).

## Constraints
- Keep preview-only semantics: no backend writes without explicit save action.
- Do not alter real Home runtime behavior; changes stay isolated to customization preview components.
- Maintain Spanish-visible labels in preview surfaces.
- Preserve current test determinism and avoid environment-dependent assertions.

## Data Model Impact
- None on Firestore schema or callable contracts.
- Local preview fixtures only: add resource-type parity (`file`) within in-memory topic fixture data.

## Validation Strategy
- Run focused unit suite:
  - `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`
- Run customization e2e smoke for gating visibility:
  - `npm run test:e2e -- tests/e2e/branding.spec.js`
- Confirm diagnostics:
  - `get_errors` clean on touched source/test files.

## Rollback Notes
- Revert isolated Phase 07 commits touching only preview + tests + docs artifacts.
- No migration rollback needed because no persistent schema/data writes are introduced.

## Progress Update (2026-04-04)
- Fullscreen overlay container now keeps flex stage layout and screen-bound dimensions in [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx).
- Fullscreen body scroll lock added with safe restore-on-exit in [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx).
- Added `Archivos` parity resource type and Spanish label normalization in [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx).
- Added regression assertions for fullscreen root layout and keyboard exit, plus files-resource drilldown checks in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).

## Status
- IMPLEMENTATION_COMPLETE (2026-04-04)
- VALIDATION_COMPLETE (2026-04-04)
