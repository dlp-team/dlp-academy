<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/phases/phase-06-global-scrollbar-overlay-and-theme-adaptation.md -->
# Phase 06 - Global Scrollbar Overlay and Theme Adaptation

## Status
- COMPLETED

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

## Implementation Update (2026-04-08)
- Updated global scrollbar behavior in `src/index.css` to remove gutter-based side compensation:
	- removed `scrollbar-gutter` reservation in active/stable/overlay mode classes,
	- switched to `overflow-y: scroll` in active scrollbar modes to prevent layout jumps without left/right clipping artifacts.
- Preserved transparent track and theme-token thumb gradient behavior for light/dark adaptation.

## Validation Evidence (2026-04-08)
- `get_errors` on touched files -> PASS.
- `npm run test -- tests/unit/components/CustomScrollbar.test.jsx tests/unit/pages/theme-preview/ThemePreview.test.jsx tests/unit/pages/institution-admin/InstitutionCustomizationMockView.test.jsx` -> PASS.
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> PASS.
