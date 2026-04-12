# index.css

## Changelog
- **2026-04-12:** Added fixed-header-aware overlay inset rule (`body.has-fixed-header .app-global-scrollbar > .os-scrollbar-vertical`) and `--app-fixed-header-height` token so vertical scrollbar rail starts below the fixed header.
- **2026-04-12:** Migrated global scrollbar behavior to OverlayScrollbars host styling (`.app-global-scrollbar` + `.os-theme-dlp`) with hidden native body scroll, transparent track, and token-driven thumb colors for instant light/dark response.
- **2026-04-12:** Replaced class-gated scrollbar styles (`custom-scrollbar-*`) and Home-only gradient variants with one unconditional global scrollbar block on `html/body` using transparent tracks, gray theme tokens, and `scrollbar-gutter: stable` + `overflow-x: hidden` to avoid layout shift.
- **2026-04-10:** Added scrollbar-box artifact suppression follow-up: transparent `::-webkit-scrollbar-track-piece`, hidden scrollbar buttons, transparent resizer/corner surfaces, and active-mode `overflow-y: auto` + `scrollbar-gutter: auto` to keep only thumb visuals visible.
- **2026-04-10:** Replaced scrollbar token `color-mix(...)` values with deterministic gray RGBA values, removed fixed active-mode scrollbar gutter backgrounds, and corrected dark-mode active scrollbar selector coverage so thumb colors update live on theme switch without page refresh.
- **2026-04-08:** Removed global `scrollbar-gutter` reservation in active scrollbar modes and switched to `overflow-y: scroll` to avoid centered-layout cut-off artifacts while keeping no-layout-shift behavior.
- **2026-04-07:** Added theme-driven scrollbar variables and switched global/home scrollbar gradients to CSS variable tokens for light/dark/system parity.
- **2026-04-07:** Enforced `scrollbar-gutter: stable both-edges` in active scrollbar modes to prevent layout shift when scrollbars appear/disappear while preserving centered composition.
- **2026-04-05:** Added mode-specific global scrollbar behavior classes (`custom-scrollbar-overlay`, `custom-scrollbar-stable`) and right-edge surface smoothing backgrounds for active scrollbar mode.
- **2026-04-05:** Changed global custom scrollbar compensation from `scrollbar-gutter: stable both-edges` to `scrollbar-gutter: stable` to remove left-side reserved spacing artifact while preserving right-side scrollbar stability.

## Purpose
- **Source file:** `src/index.css`
- **Last documented:** 2026-04-12
- **Role:** Global stylesheet for theme tokens, OverlayScrollbars host/theme styling, and app-wide baseline visual behavior.

## Relevant Sections for Phase 01
- `html, body, #root` and `body`
  - Enforces full-height app shell and disables native body scrolling so overlay host owns vertical scroll behavior.
- `.app-global-scrollbar`
  - Sets the root overlay host dimensions for app-wide scroll containment.
- `body.has-fixed-header .app-global-scrollbar > .os-scrollbar-vertical`
  - Offsets the vertical scrollbar track by the fixed header height so the scrollbar does not overlap the header surface.
- `.os-theme-dlp`
  - Provides transparent track and token-driven thumb variables for light/dark scrollbar visuals.

## Maintenance Notes
- Keep scrollbar tokens (`--scrollbar-thumb-start`, `--scrollbar-thumb-hover-start`) synchronized between `:root` and `.dark` to preserve immediate theme-mode reaction.
- If overlay behavior is changed, verify `src/App.tsx` options and `src/main.tsx` stylesheet import remain aligned.
