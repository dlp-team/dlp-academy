<!-- copilot/explanations/temporal/lossless-reports/2026-04-03/phase-07-preview-v2-fullscreen-and-deep-navigation.md -->
# Lossless Report - Phase 07 Preview 2.0 (2026-04-03)

## Requested Scope
- Expand Institution Admin customization preview to behave as an exact navigable replica with mock data.
- Add fullscreen preview mode while keeping left controls available and collapsible.
- Make Home preview tabs functional (`Manual`, `Uso`, `Cursos`, `Compartido`, `Papelera`).
- Support deep navigation into folders/subjects/topics and topic content types.
- Preserve no-write preview behavior and keep save explicit.

## Preserved Behaviors
- No production data reads/writes were introduced in the preview path; mock-only data remains local.
- Existing customization save flow remains explicit and unchanged (`Guardar` only).
- Existing role toggle and viewport toggle behavior remains intact.
- Existing layout/style fixes from prior phase (Users search placement, wrapped tab strip) remain untouched.

## Files Touched
- `src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx`
- `src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx`
- `tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`
- `copilot/plans/active/original-plan-autopilot-execution-2026-04-03/phases/phase-06-institution-admin-layout-and-preview-audit-planned.md`
- `copilot/plans/active/original-plan-autopilot-execution-2026-04-03/phases/phase-07-institution-preview-v2-implementation-planned.md`
- `copilot/plans/active/original-plan-autopilot-execution-2026-04-03/strategy-roadmap.md`
- `copilot/plans/active/original-plan-autopilot-execution-2026-04-03/README.md`
- `copilot/plans/active/original-plan-autopilot-execution-2026-04-03/working/institution-preview-architecture-audit.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.md`
- `copilot/explanations/codebase/src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.md`
- `copilot/explanations/codebase/tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.md`

## Implementation Summary
- Upgraded `InstitutionCustomizationMockView` to support:
  - collapsible controls sidebar,
  - compact collapsed controls,
  - fullscreen mode with `Esc` exit hint.
- Upgraded `CustomizationHomeExactPreview` to support:
  - functional Home tab switching through real `HomeControls`,
  - dynamic grouped mock datasets for `Uso` and `Cursos`,
  - academic-year range filtering in `Cursos`,
  - shared-tab reuse via real `SharedView`,
  - deterministic mock bin panel for `Papelera`,
  - deep drilldown panel (`asignatura -> tema -> contenido`) with content-type cards.
- Extended unit tests to cover:
  - fullscreen + sidebar collapse controls,
  - tab switching (`Papelera`, `Compartido`, `Manual`),
  - subject/topic deep drilldown assertions.

## Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS (5/5 tests).
- `get_errors` on touched source/test files -> clean.

## Risks and Mitigations
- Risk: preview state complexity increases with tab + drilldown state.
  - Mitigation: deterministic static mock data + explicit tab-switch reset guards.
- Risk: shared tab depends on router context due `SharedView` internals.
  - Mitigation: tests wrap component with `MemoryRouter`.

## Follow-up
- Remaining roadmap priority remains Phase 05 pagination completion and Phase 09 real E2E validation.
