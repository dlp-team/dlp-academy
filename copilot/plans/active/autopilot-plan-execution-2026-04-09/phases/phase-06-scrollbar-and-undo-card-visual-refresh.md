<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/phases/phase-06-scrollbar-and-undo-card-visual-refresh.md -->
# Phase 06 - Scrollbar and Undo Card Visual Refresh

## Status
- IN_REVIEW

## Objective
Apply cleaner, theme-adaptive visual styling to the global scrollbar and undo-action card surfaces.

## Scope
- Update scrollbar to transparent track with neutral gray thumb colors that adapt in dark/light modes.
- Ensure scrollbar behavior does not create layout cut-offs or forced side gutters.
- Restyle undo/action cards for simpler, less highlighted presentation.

## Risks
- Global CSS changes can impact unrelated pages/components.
- Browser-specific scrollbar behavior may vary.

## Validation
- Visual regression checks across key pages.
- Manual checks in both theme modes.
- `get_errors`, `npm run lint`, and targeted UI tests where available.

## Exit Criteria
- Scrollbar visuals are clean, transparent-track, and theme-consistent.
- Undo/action cards use refined low-contrast styling without readability loss.

## Implementation Update (2026-04-09)
- Updated global scrollbar color tokens to neutral gray ranges while preserving transparent track behavior.
- Refined minimal-scrollbar variants for light/dark themes with cleaner grayscale thumb states.
- Restyled `UndoActionToast` surface to low-contrast white/gray card treatment and moved placement to lower-left.

## Validation Evidence (2026-04-09)
- `get_errors` on touched style/toast files -> PASS.
- `npm run test -- tests/unit/components/UndoActionToast.test.jsx tests/unit/components/AppToast.test.jsx` -> PASS.
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> PASS.
- `npm run build` -> PASS.
