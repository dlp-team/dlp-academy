# FileCard.jsx

## Overview
- **Source file:** `src/pages/Topic/FileCard/FileCard.jsx`
- **Last documented:** 2026-02-24
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Handles user events and triggers updates/actions.
- Participates in navigation/routing behavior.

## Exports
- `default FileCard`

## Main Dependencies
- `react`
- `react-router-dom`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
- 2026-03-29: Added category editor controls to the 3-dot menu for editable upload cards (`Material teórico`, `Ejercicios`, `Exámenes`) with active-state checkmarks.
- 2026-03-29: Badge positioning now offsets when edit menu is available to avoid overlap with the 3-dot action button.
- 2026-03-29: Added optional `badgeLabel` prop for contextual card tags (used to mark the student source PDF as "Documento base").
- 2026-03-29: Added optional `onView` callback override so parents can reuse FileCard visuals with custom navigation/view logic (used by student `materiales` cards) while preserving default behavior for existing usages.
