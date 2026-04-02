<!-- copilot/explanations/codebase/src/components/ui/AcademicYearRangeFilter.md -->
# AcademicYearRangeFilter.tsx

## Overview
- **Source file:** `src/components/ui/AcademicYearRangeFilter.tsx`
- **Last documented:** 2026-04-02
- **Role:** Reusable filter control that lets users select an academic-year range from existing years only.

## Responsibilities
- Renders a compact control button for courses-tab academic-year filtering.
- Shows a floating panel with:
  - start/end selector targets,
  - paginated academic-year chips (`10` per page),
  - clear-filter action.
- Emits normalized range selections through `onChange`.
- Keeps panel aligned to viewport bounds and reports open/close state through `onOverlayToggle`.

## Exports
- `default AcademicYearRangeFilter`

## Main Dependencies
- `react`
- `lucide-react`

## Changelog
- **2026-04-02:** Initial implementation for Phase 05 courses-tab year-range filtering:
  - existing-years-only options,
  - paginated year card,
  - start/end selection workflow,
  - inline clear action.
