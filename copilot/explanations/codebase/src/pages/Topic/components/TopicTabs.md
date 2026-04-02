# TopicTabs.jsx

## Overview
- **Source file:** `src/pages/Topic/components/TopicTabs.jsx`
- **Last documented:** 2026-02-24
- **Role:** Reusable UI component consumed by the parent page/module.

## Responsibilities
- Handles user events and triggers updates/actions.

## Exports
- `default TopicTabs`

## Main Dependencies
- `react`
- `lucide-react`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
- 2026-04-02: Student-tab mode detection now uses `getActiveRole(user)` so tab layout stays consistent with switched role context.
- 2026-03-29: Student `materiales` badge counter updated to include new upload categories (`material-teorico`, `ejercicios`, `examenes`) while preserving legacy compatibility (`resumen`, `examen`).
- 2026-03-12: Added `Tareas` tab (`assignments`) with dedicated icon and item counter, preserving plus-action behavior only for IA materials/tests creation tabs.
