<!-- copilot/plans/active/original-plan-autopilot-execution-2026-04-03/phases/phase-07-institution-preview-v2-implementation-planned.md -->
# Phase 07 - Institution Preview 2.0 Implementation

## Status
COMPLETED

## Objective
Deliver an exact-structure, deeply navigable customization preview with collapsible controls and fullscreen capability.

## Work Items
- Implement fullscreen preview mode while keeping left control panel collapsible.
- Expand preview navigation coverage: Manual, Usage, Courses, Shared, Bin.
- Enable deep drill-down mock navigation: folders -> subjects -> topics -> content types (exams/tests/quizzes/materials/formulas/study guides).
- Ensure dynamic branding elements apply live (colors, institution name, logo, icon).

## Preserved Behaviors
- Existing customization settings and save mechanics remain intact.
- Existing real-user data paths remain isolated from preview mocks.

## Risks
- Performance costs from rendering near-real app shell inside preview.
- State sync complexity between customization controls and mock app navigation.

## Validation
- Manual interaction walkthrough across all preview tabs and deep levels.
- `get_errors` and targeted UI tests where feasible.

## Exit Criteria
- Preview supports fullscreen and deep interactive replica navigation with mock data.

## Implementation Notes (2026-04-03)
- Upgraded `InstitutionCustomizationMockView` with:
	- fullscreen mode toggle + `Esc` exit behavior,
	- collapsible left controls panel with compact collapsed state,
	- unchanged explicit save semantics (no implicit persistence).
- Upgraded `CustomizationHomeExactPreview` with:
	- fully functional Home-tab switching for Manual/Uso/Cursos/Compartido/Papelera,
	- dynamic grouped mock datasets for usage/courses with academic-year filtering,
	- shared-tab rendering via real `SharedView` reuse,
	- mock bin tab with restore/delete simulation actions,
	- deep subject drilldown panel (asignatura -> tema -> contenido por tipo: exámenes, tests, quizzes, material, fórmulas, guías).

## Validation Evidence
- `npm run test -- tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`
- `get_errors` clean on:
	- `src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx`
	- `src/pages/InstitutionAdminDashboard/components/customization/CustomizationHomeExactPreview.tsx`
	- `tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx`
