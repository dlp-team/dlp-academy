<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/phases/phase-06-global-scrollbar-overlay-and-theme-adaptation.md -->
# Phase 06 - Global Scrollbar Overlay and Theme Adaptation

## Status
- PLANNED

## Objective
Restore full-width centered layout and implement non-cutting overlay-like scrollbar styling with proper dark/light adaptation.

## Scope
- Remove `scrollbar-gutter` and side compensation artifacts.
- Keep full-width layout (no left/right cut-offs).
- Use transparent track and theme variable thumb colors.
- Ensure no visible layout shift from scrollbar visibility.

## Validation
- Visual checks in light/dark mode.
- Breakpoint checks for horizontal clipping.
- Regression checks for centered layout.
