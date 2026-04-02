<!-- copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-06-home-admin-ux-reliability-and-selection-mode-enhancements.md -->

# Phase 06 - Home/Admin UX Reliability and Selection Mode Enhancements

## Status
- PLANNED

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
- `src/pages/Home/Home.jsx`
- `src/pages/Home/components/HomeControls.jsx`
- `src/pages/Home/components/HomeSelectionToolbar.jsx`
- `src/pages/Home/components/BinView.jsx`
- `src/pages/AdminDashboard/AdminDashboard.jsx`

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
- Pending.

