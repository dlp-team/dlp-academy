<!-- copilot/plans/active/autopilot-plan-scrollbar-execution-2026-04-12/phases/phase-05-global-scrollbar-fix.md -->
# Phase 05 - Global Scrollbar Fix

## Objective
Finalize global scrollbar behavior so it is visually stable, theme-reactive, and free of track/opacity artifacts.

## Scope
- Execute global scrollbar fixes guided by the ingested scrollbar source reference.
- Ensure dark/light/system mode changes update scrollbar tokens without requiring refresh.
- Preserve modal/content container behavior that already relies on `custom-scrollbar` utility classes.

## Primary File Surfaces
- `src/index.css`
- `src/components/ui/CustomScrollbar.tsx`
- `src/App.tsx`

## Acceptance Criteria
- No flicker, phantom track surfaces, or stale theme thumb colors.
- Layout remains stable across major pages and overlays.

## Validation
- `npm run lint`
- `npx tsc --noEmit`
- `npm run test`
- `npm run build`
- Manual dark/light/system switch validation on Home, content pages, and modals.