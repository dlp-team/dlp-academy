<!-- copilot/plans/active/autopilot-plan-execution-2026-04-10/phases/phase-05-scrollbar-and-current-academic-filter-fix.md -->
# Phase 05 - Scrollbar and Current Academic Filter Fix

## Status
- IN_REVIEW

## Objective
Fix global scrollbar theme responsiveness and correct `Solo Vigentes` filtering rules.

## Scope
- Scrollbar style updates when dark/light mode changes without page refresh.
- Clean neutral scrollbar palette with transparent track behavior.
- `Solo Vigentes` must only include subjects in current academic year, active trimester, and not finalized.

## Risks
- Theme token update path may not notify global CSS selectors.
- Filter logic may be split across tabs/hooks and can drift by view.

## Exit Criteria
- [x] Scrollbar colors update immediately on mode switch.
- [x] Scrollbar track transparency and thumb colors meet style requirement.
- [x] `Solo Vigentes` returns only eligible current subjects.

## Implementation Update (2026-04-10)
- Updated global scrollbar color tokens in `src/index.css` to stable gray RGBA values and removed fixed light/dark gutter backgrounds to preserve transparent track behavior.
- Corrected dark-mode global scrollbar selector coverage so runtime theme switches apply immediately without requiring page refresh.
- Tightened `showOnlyCurrentSubjects` eligibility in `src/hooks/useHomeState.ts` to enforce current academic year records only, while requiring lifecycle-active status and active period-window matching when period metadata is available.
- Follow-up hardening in [src/index.css](../../../../../src/index.css): transparent track-piece enforcement, hidden scrollbar buttons, transparent resizer/corner handling, and active-mode `overflow-y: auto` + `scrollbar-gutter: auto` to remove visible scrollbar box artifacts while leaving thumb visibility intact.

## Validation Evidence (2026-04-10)
- `get_errors` on touched source/test files -> PASS.
- `npm run test -- tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/pages/home/HomeControls.activeCurrentToggle.test.jsx tests/unit/components/CustomScrollbar.test.jsx` -> PASS (16 tests).
- `npm run test:unit -- tests/unit/components/FolderListItem.collapseSpacing.test.jsx tests/unit/components/ListViewItem.selectionDimming.test.jsx tests/unit/components/CustomScrollbar.test.jsx tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/hooks/useHomeBulkSelection.test.js` -> PASS (23 tests).
