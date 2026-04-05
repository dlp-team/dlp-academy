# index.css

## Changelog
- **2026-04-05:** Changed global custom scrollbar compensation from `scrollbar-gutter: stable both-edges` to `scrollbar-gutter: stable` to remove left-side reserved spacing artifact while preserving right-side scrollbar stability.

## Purpose
- **Source file:** `src/index.css`
- **Last documented:** 2026-04-05
- **Role:** Global stylesheet for theme tokens, home page scrollbar variants, and app-wide baseline visual behavior.

## Relevant Sections for Phase 01
- `html.custom-scrollbar-active, body.custom-scrollbar-active`
  - Controls global scrollbar reservation and thumb/track appearance when Home-style scrollbar mode is active.
- `.home-page` and `.home-page *` scrollbar blocks
  - Scoped Home surface scrollbar appearance.

## Maintenance Notes
- Keep compensation strategy conservative (`stable`) unless there is a confirmed requirement to reserve both edges.
- Validate desktop/mobile modal and centered layout behavior when changing global scrollbar-gutter settings.
