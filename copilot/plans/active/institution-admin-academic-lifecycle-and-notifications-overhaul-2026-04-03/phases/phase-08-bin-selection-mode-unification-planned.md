<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-08-bin-selection-mode-unification-planned.md -->
# Phase 08 - Bin Selection Mode Unification (FINISHED)

## Objective
Unify selection visuals between Bin and other views and introduce non-opacity dimming for unselected items.

## Planned Changes
- Reuse shared selection styling logic between manual and bin modes.
- When at least one item is selected, dim unselected items with brightness/saturation strategy.
- Keep folder legibility by avoiding opacity changes.
- Rename Bin sort labels to:
  - `Urgencia: Ascendente`
  - `Urgencia: Descendente`

## Progress Update (2026-04-04)
- Introduced shared selection visual utility in [src/utils/selectionVisualUtils.ts](src/utils/selectionVisualUtils.ts) with a single ring-token class and bin dimming helper.
- Updated manual-surface components to consume shared selection ring logic:
  - [src/components/modules/SubjectCard/SubjectCard.tsx](src/components/modules/SubjectCard/SubjectCard.tsx)
  - [src/components/modules/FolderCard/FolderCard.tsx](src/components/modules/FolderCard/FolderCard.tsx)
  - [src/components/modules/ListViewItem.tsx](src/components/modules/ListViewItem.tsx)
- Updated bin grid and list rendering to dim unselected entries via brightness/saturation (no opacity dim):
  - [src/pages/Home/components/bin/BinGridItem.tsx](src/pages/Home/components/bin/BinGridItem.tsx)
  - [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx)
- Renamed bin urgency sort labels to `Urgencia: Ascendente` and `Urgencia: Descendente` in [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx).
- Added focused regression suite for bin card parity/dimming behavior in [tests/unit/components/BinGridItem.test.jsx](tests/unit/components/BinGridItem.test.jsx).

## Validation Evidence
- `npm run test -- tests/unit/components/BinGridItem.test.jsx tests/unit/components/BinSelectionOverlay.test.jsx tests/unit/pages/home/binViewUtils.test.js`
- `npm run test:e2e -- tests/e2e/bin-view.spec.js` (suite skipped by environment gate; no runtime failures)
- `get_errors` clean for touched source/test files.

## Remaining in Phase 08
- None. Selection parity, dimming strategy, and sort-label scope completed.

## Risks and Controls
- Risk: global style changes regress non-bin views.
  - Control: isolate style hooks and verify across Home and Bin modes.

## Exit Criteria
- Selection border consistency is visually identical.
- Dimming behavior works without affecting folder content readability.
