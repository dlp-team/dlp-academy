<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-08/subplans/subplan-institution-customization-ui.md -->
# Subplan: Institution Customization UI

## Objective
Fix customization tab interactions before architecture migration.

## Requested Outcomes
- Card body click selects card only.
- Swatch click opens color selector only (with propagation stop).
- Hex value can be edited directly via text input.
- Save and reset actions execute via confirmation overlays.

## Candidate Target Files
- `src/pages/InstitutionAdminDashboard/**`
- `src/components/ui/BaseOverlay*` (reuse only, no custom overlays)

## Risks
- State desynchronization between selected card and color picker target.
- Save/reset confirmations bypassing actual handlers.

## Validation
- UI interaction tests for card vs swatch click.
- Save/reset confirmation acceptance/cancel behavior.
- Spanish copy and icon-only constraints check.
