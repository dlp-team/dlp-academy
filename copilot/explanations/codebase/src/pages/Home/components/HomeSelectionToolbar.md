# HomeSelectionToolbar.tsx

## Overview
- **Source file:** `src/pages/Home/components/HomeSelectionToolbar.tsx`
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
- **2026-04-02:** Selection-mode toolbar refined for safer UX:
	- grouped creation/move/delete actions for faster scanning,
	- added explicit safety copy that delete action moves items to paper bin (not permanent delete),
	- kept callback API unchanged for lossless integration with `Home.tsx`.
- **2026-03-13:** Extracted from `Home.jsx` to reduce page-level complexity and keep selection UX isolated as a dedicated component.
