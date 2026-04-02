# HomeControls.jsx

## Changelog
- **2026-04-02:** Added `Solo vigentes` toggle for `courses` and `usage` modes, wired to persisted `showOnlyCurrentSubjects` preference updates.
- **2026-04-02:** Added `Año académico` range filter control (existing years only, paginated panel) next to `Filtrar` in `courses` mode and wired overlay state sharing.
- **2026-04-02:** Retired `Historial` mode from the Home mode switcher and removed its icon mapping, preserving all remaining mode controls.
- **2026-04-01:** Added `Historial` mode tab with dedicated icon mapping (`history` -> completion icon) in the Home mode switcher.
- **2026-03-12:** Added explicit support for hiding the shared-scope toggle in contexts where it should not appear (notably the shared tab).

## Overview
- **Source file:** `src/pages/Home/components/HomeControls.tsx`
- **Last documented:** 2026-04-02
- **Role:** Reusable UI component consumed by the parent page/module.

## Responsibilities
- Handles user events and triggers updates/actions.

## Exports
- `default HomeControls`

## Main Dependencies
- `react`
- `../../../components/ui/ViewLayoutSelector`
- `../../../components/ui/CardScaleSlider`
- `../../../components/ui/TagFilter`
- `../../../components/ui/AcademicYearRangeFilter`
- `../../../components/ui/SearchBar`
- `../hooks/useHomeControlsHandlers`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
