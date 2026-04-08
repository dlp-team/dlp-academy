<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/subplans/subplan-bin-section-readonly-navigation.md -->
# Subplan: Bin Section Read-Only Navigation

## Objective
Align bin tab press behavior between grid/list modes and add read-only content navigation parity.

## Requested Outcomes
- Softer background fade on press and no option-reveal delay.
- Card border emphasis only in selection mode; otherwise focus via scale.
- Same style parity for list mode.
- "Ver contenido" opens subject/topic content in read-only mode with no mutation paths.

## Candidate Target Files
- `src/pages/Home/**`
- `src/pages/Topic/**`
- `src/utils/permissionUtils.js` (if guards are required)

## Risks
- Reusing writable handlers in read-only route context.
- Visual behavior divergence between list and grid event paths.

## Validation
- Mode parity checks (grid/list).
- Read-only mutation guard tests.
- `get_errors`, lint, and targeted navigation tests.
