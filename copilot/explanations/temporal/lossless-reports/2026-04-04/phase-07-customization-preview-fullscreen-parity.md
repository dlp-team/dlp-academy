<!-- copilot/explanations/temporal/lossless-reports/2026-04-04/phase-07-customization-preview-fullscreen-parity.md -->
# Lossless Review Report - Phase 07 Customization Preview Fullscreen Parity

## Requested Scope
- Fix customization preview fullscreen black-screen/layering issue.
- Improve mock preview fidelity so topic content includes parity for files alongside existing formulas/exams/tests/quizzes/materials.
- Preserve all non-requested behavior (preview-only save semantics, role/viewport toggles, tab navigation).

## Preserved Behaviors Checklist
- Explicit save-only persistence behavior remains unchanged in [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx).
- Role toggle (`docente`/`estudiante`) and viewport switching remain unchanged in [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx).
- Existing preview tab coverage (`Manual`, `Uso`, `Cursos`, `Compartido`, `Papelera`) remains unchanged in [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx).
- Existing unit assertions for save flow, palette apply, and tab drilldown remain intact in [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx).

## Touched Files
- [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx)
- [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx)
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx)
- [copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-07-customization-preview-parity-planned.md](copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-07-customization-preview-parity-planned.md)
- [copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md](copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md)
- [copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/README.md](copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/README.md)
- [copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/README.md](copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/README.md)
- [copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/customization-preview-parity-subplan.md](copilot/plans/inReview/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/subplans/customization-preview-parity-subplan.md)
- [copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.md](copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.md)
- [copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.md](copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.md)
- [copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md](copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md)
- [copilot/explanations/temporal/institution-admin/phase-07-customization-preview-parity-2026-04-04.md](copilot/explanations/temporal/institution-admin/phase-07-customization-preview-parity-2026-04-04.md)

## File-by-File Verification
- [src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx](src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx): fullscreen root now keeps preview in-frame (`flex`, full viewport sizing) and adds body-scroll lock lifecycle; non-fullscreen embedding unchanged.
- [src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx](src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx): parity fixture now includes `Archivos` type and Spanish labels for previously mixed-language resource names; rendering maps updated with icon/description only.
- [tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx](tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx): fullscreen regression assertions added (container class + `Esc` exit) and drilldown parity assertion expanded to `Archivos`.

## Validation Summary
- `get_errors` clean for all touched source/test files.
- Passed: `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`.
- Executed: `npm run test:e2e -- tests/e2e/branding.spec.js` with environment-gated skip; no runtime failure.

## Risk Review
- Residual risk: fullscreen visual behavior can still vary with external container wrappers in future layout refactors.
- Control: regression test now anchors expected fullscreen root semantics and keyboard exit behavior.
