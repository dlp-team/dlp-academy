# HomeSelectionToolbar.jsx

## Overview
- **Source file:** `src/pages/Home/components/HomeSelectionToolbar.jsx`
- **Last documented:** 2026-03-13
- **Role:** Reusable UI toolbar for Home multi-selection bulk actions.

## Responsibilities
- Renders select-mode toggle for Home manual views.
- Shows selected-count feedback.
- Exposes bulk action controls: delete selected, move selection, create folder with selection.
- Delegates all actions to callbacks from parent (`Home.jsx`).

## Exports
- `default HomeSelectionToolbar`

## Main Dependencies
- `react`
- `lucide-react`

## Changelog
- **2026-03-13:** Extracted from `Home.jsx` to reduce page-level complexity and keep selection UX isolated as a dedicated component.
