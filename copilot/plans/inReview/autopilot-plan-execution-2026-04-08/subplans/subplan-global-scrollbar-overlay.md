<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/subplans/subplan-global-scrollbar-overlay.md -->
# Subplan: Global Scrollbar Overlay

## Objective
Restore full-width layout while making scrollbar visually overlay at the right edge and theme-consistent.

## Requested Outcomes
- Remove `scrollbar-gutter` and any side cut-off/padding compensation.
- Keep web content full-width and centered.
- Transparent track + theme-adaptive thumb colors.
- Prevent horizontal shift when scrollbar appears/disappears.

## Candidate Target Files
- `src/index.css`
- `src/App.css` (only if global wrappers influence overflow behavior)

## Risks
- Horizontal overflow clipping on smaller breakpoints.
- Browser-specific scrollbar behavior divergence.

## Validation
- Visual check on light/dark themes.
- Desktop/mobile breakpoint checks.
- Regression check for layout centering.
