# CustomScrollbar.tsx

## Changelog
- **2026-04-05:** Updated usage annotation to reference `App.tsx` and aligned documentation with current TypeScript app entrypoint.

## Purpose
- **Source file:** `src/components/ui/CustomScrollbar.tsx`
- **Last documented:** 2026-04-05
- **Role:** Lightweight mount/unmount helper that toggles global classes used by scrollbar styling rules.

## Responsibilities
- Add `custom-scrollbar-active` to `html` and `body` on mount.
- Remove those classes on unmount.
- Delegate all visual styling behavior to `src/index.css`.

## Notes
- This component intentionally renders `null` and only controls global class state.
- Scrollbar spacing behavior is defined in CSS under `html.custom-scrollbar-active` and `body.custom-scrollbar-active`.
