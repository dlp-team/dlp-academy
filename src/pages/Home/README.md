# Home Feature Module

This folder contains all components, hooks, and logic specific to the Home page.

## Structure
- `Home.jsx`: Entry point for the Home page.
- `components/`: Home-only components (HomeContent, HomeControls, HomeModals, HomeDeleteConfirmModal, etc.)
- `hooks/`: Home-specific hooks (`useHomeLogic`, `useHomePageState`, `useHomePageHandlers`, `useHomeContentDnd`, `useHomeControlsHandlers`, etc.)
- `modals/`: Home-specific modals (if any)

## Notes
- Use only for Home-specific logic. Reusable UI should go in `src/components/ui/` or `src/components/modules/`.
- Home page split is currently lossless and behavior-preserving; new hooks/components were extracted to reduce `Home.jsx`, `HomeContent.jsx`, and `HomeModals.jsx` responsibilities.
- Update this README if you add new major features or refactor the Home module.
