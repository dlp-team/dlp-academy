# index.css

## Changelog
- **2026-04-10:** Added scrollbar-box artifact suppression follow-up: transparent `::-webkit-scrollbar-track-piece`, hidden scrollbar buttons, transparent resizer/corner surfaces, and active-mode `overflow-y: auto` + `scrollbar-gutter: auto` to keep only thumb visuals visible.
- **2026-04-10:** Replaced scrollbar token `color-mix(...)` values with deterministic gray RGBA values, removed fixed active-mode scrollbar gutter backgrounds, and corrected dark-mode active scrollbar selector coverage so thumb colors update live on theme switch without page refresh.
- **2026-04-08:** Removed global `scrollbar-gutter` reservation in active scrollbar modes and switched to `overflow-y: scroll` to avoid centered-layout cut-off artifacts while keeping no-layout-shift behavior.
- **2026-04-07:** Added theme-driven scrollbar variables and switched global/home scrollbar gradients to CSS variable tokens for light/dark/system parity.
- **2026-04-07:** Enforced `scrollbar-gutter: stable both-edges` in active scrollbar modes to prevent layout shift when scrollbars appear/disappear while preserving centered composition.
- **2026-04-05:** Added mode-specific global scrollbar behavior classes (`custom-scrollbar-overlay`, `custom-scrollbar-stable`) and right-edge surface smoothing backgrounds for active scrollbar mode.
- **2026-04-05:** Changed global custom scrollbar compensation from `scrollbar-gutter: stable both-edges` to `scrollbar-gutter: stable` to remove left-side reserved spacing artifact while preserving right-side scrollbar stability.

## Purpose
- **Source file:** `src/index.css`
- **Last documented:** 2026-04-10
- **Role:** Global stylesheet for theme tokens, home page scrollbar variants, and app-wide baseline visual behavior.

## Relevant Sections for Phase 01
- `html.custom-scrollbar-active, body.custom-scrollbar-active`
  - Controls global scrollbar reservation strategy and thumb/track appearance when Home-style scrollbar mode is active.
- `html.custom-scrollbar-overlay, body.custom-scrollbar-overlay`
  - Alias mode now aligned to stable gutter behavior to avoid runtime drift.
- `html.custom-scrollbar-stable, body.custom-scrollbar-stable`
  - Enforces no-layout-jump gutter behavior as primary strategy.
- `.home-page` and `.home-page *` scrollbar blocks
  - Scoped Home surface scrollbar appearance using shared scrollbar color variables and transparent track-piece suppression.

## Maintenance Notes
- Keep active-mode scrollbar behavior on `overflow-y: auto` and `scrollbar-gutter: auto` to avoid forced gutter strips while preserving thumb-only visuals.
- Validate desktop/mobile modal and centered layout behavior when changing global scrollbar-gutter settings.
