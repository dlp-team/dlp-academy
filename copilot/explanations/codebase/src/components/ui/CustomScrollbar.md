# CustomScrollbar.tsx

## Changelog
- **2026-04-07:** Simplified runtime behavior to always apply `custom-scrollbar-stable`, removing overlay-mode detection to prioritize deterministic no-shift layout behavior.
- **2026-04-05:** Added overlay-support detection with mode class toggling (`custom-scrollbar-overlay` vs `custom-scrollbar-stable`) so scrollbar behavior can be overlay-first with stable fallback.
- **2026-04-05:** Updated usage annotation to reference `App.tsx` and aligned documentation with current TypeScript app entrypoint.

## Purpose
- **Source file:** `src/components/ui/CustomScrollbar.tsx`
- **Last documented:** 2026-04-05
- **Role:** Lightweight mount/unmount helper that toggles global classes used by scrollbar styling rules.

## Responsibilities
- Add `custom-scrollbar-active` to `html` and `body` on mount.
- Add deterministic `custom-scrollbar-stable` mode class to `html` and `body`.
- Remove those classes on unmount.
- Delegate all visual styling behavior to `src/index.css`.

## Notes
- This component intentionally renders `null` and only controls global class state.
- Scrollbar spacing behavior is defined in CSS under `html.custom-scrollbar-active` and `body.custom-scrollbar-active`.
