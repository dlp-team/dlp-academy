<!-- copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-07-customization-preview-parity-planned.md -->
# Phase 07 - Customization Preview Parity (FINISHED)

## Objective
Resolve preview full-screen black screen bug and improve mock preview fidelity to mirror real UI behavior.

## Planned Changes
- Fix full-screen rendering/layering issue.
- Rebuild preview content paths to match real Home/Subject/Topic structures.
- Ensure materials (formulas, exams, quizzes, files) are represented consistently with production components.

## Progress Update (2026-04-04)
- Fixed fullscreen preview container rendering by preserving full-stage flex layout and viewport locking in [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx).
- Added fullscreen body-scroll locking and release-on-exit behavior to avoid off-screen stacking and background scroll bleed in [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx).
- Added deterministic fullscreen regression coverage (layout class assertions + keyboard exit) in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).
- Improved topic-content parity by adding `Archivos` as a first-class preview resource type and localizing remaining preview resource labels to Spanish in [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx).
- Extended deep-drilldown test assertions to include new files resource visibility in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).

## Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`
- `npm run test:e2e -- tests/e2e/branding.spec.js` (suite skipped by environment gate; no runtime failures)
- `get_errors` clean for touched source/test files.

## Remaining in Phase 07
- None. Fullscreen reliability and preview content-type parity scope completed.

## Risks and Controls
- Risk: preview-specific branching diverges from real components.
  - Control: share rendering helpers/components with production where possible.

## Exit Criteria
- Full-screen preview works reliably.
- Visual/structural parity between preview and live pages is significantly improved.
