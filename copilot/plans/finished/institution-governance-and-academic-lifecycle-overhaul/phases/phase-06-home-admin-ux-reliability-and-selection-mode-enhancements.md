<!-- copilot/plans/finished/institution-governance-and-academic-lifecycle-overhaul/phases/phase-06-home-admin-ux-reliability-and-selection-mode-enhancements.md -->

# Phase 06 - Home/Admin UX Reliability and Selection Mode Enhancements

## Status
- COMPLETED

## Objective
Improve high-usage navigation and bulk-operation UX while removing known visual defects.

## Scope
1. Selection mode UI overhaul for clarity and action safety.
2. Home bin sorting options:
   - urgency ascending/descending,
   - alphabetical ascending/descending.
3. Bin-only selection mode actions for mass restore and mass permanent delete.
4. Remove first-load top-left slide animation from Escala and Filtrar controls.
5. Admin dashboard institutions list: remove chevron entry icon and route by row click.

## Files Expected
- `src/pages/Home/components/HomeSelectionToolbar.tsx`
- `src/pages/Home/components/BinView.tsx`
- `src/pages/Home/components/bin/BinConfirmModals.tsx`
- `src/pages/Home/utils/binViewUtils.ts`
- `src/components/ui/CardScaleSlider.tsx`
- `src/components/ui/TagFilter.tsx`
- `src/pages/AdminDashboard/components/InstitutionTableRow.tsx`

## Risks
- Selection mode action collisions with existing keyboard shortcuts.
- Accidental destructive bulk actions without confirmation safeguards.

## Validation Gate
- Selection interactions work in grid and list contexts.
- Bin sorting stable across data refresh.
- Escala/Filtrar controls render without unintended first-load animation.
- Institution row click navigation works and preserves expected role guards.

## Rollback
- Preserve legacy interaction paths until new controls validated.

## Completion Notes
- Implemented and validated in a single slice:
   - Selection toolbar clarified with safer action messaging for non-permanent delete flow.
   - Bin sorting now supports urgency ascending/descending and alphabetical ascending/descending.
   - Bin-only selection mode added with bulk restore and bulk permanent delete (with explicit confirmation).
   - Escala/Filtrar overlays now compute position before render to remove first-load top-left jump.
   - Institution rows in global admin now navigate by row click; chevron entry icon removed.
- Validation evidence:
   - `npm run test -- tests/unit/pages/home/binViewUtils.test.js tests/unit/pages/admin/InstitutionTableRow.test.jsx` (pass)
   - `npx tsc --noEmit` (pass)
   - `npm run lint` (pass, 4 pre-existing warnings in unrelated `src/pages/Content/*`)
   - `get_errors` on touched files (clean)

