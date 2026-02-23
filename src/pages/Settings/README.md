# Settings Feature Module

This folder contains all components, hooks, and logic specific to the Settings page.

## Structure
- `Settings.jsx`: Entry point for the Settings page.
- `components/`: Settings-only presentational components (AppearanceSection, AccountSection, etc.)
- `hooks/`: Settings-specific hooks (useSettingsLogic, etc.)
- `styles/`: Settings-specific styles (Settings.module.css, etc.)

## Notes
- Use only for Settings-specific logic. Reusable UI should go in `src/components/ui/` or `src/components/shared/`.
- Update this README if you add new major features or refactor the Settings module.
