# CustomScrollbar.tsx

## Changelog
- **2026-04-05:** Added overlay-support detection with mode class toggling (`custom-scrollbar-overlay` vs `custom-scrollbar-stable`) so scrollbar behavior can be overlay-first with stable fallback.
- **2026-04-05:** Updated usage annotation to reference `App.tsx` and aligned documentation with current TypeScript app entrypoint.

## Purpose
- **Source file:** `src/components/ui/CustomScrollbar.tsx`
- **Last documented:** 2026-04-05
- **Role:** Lightweight mount/unmount helper that toggles global classes used by scrollbar styling rules.

## Responsibilities
- Add `custom-scrollbar-active` to `html` and `body` on mount.
- Add scrollbar mode class based on runtime capability:
	- `custom-scrollbar-overlay` when overlay scrollbars are supported,
	- `custom-scrollbar-stable` when fallback stable gutter mode is required.
- Remove those classes on unmount.
- Delegate all visual styling behavior to `src/index.css`.

## Notes
- This component intentionally renders `null` and only controls global class state.
- Scrollbar spacing behavior is defined in CSS under `html.custom-scrollbar-active` and `body.custom-scrollbar-active`.
