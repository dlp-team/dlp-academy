<!-- copilot/explanations/temporal/institution-admin/phase-08-bin-selection-mode-unification-2026-04-04.md -->
# Phase 08 Bin Selection Mode Unification (2026-04-04)

## Scope
Complete bin selection parity work: shared selection visuals, non-opacity dimming for unselected cards, and urgency sort label renaming.

## Before
- Bin grid selected cards used a sky ring distinct from manual-mode selection styling.
- Bin unselected cards used opacity dimming (`opacity-30`), reducing legibility and contrasting with requested brightness/saturation behavior.
- Bin urgency sort labels did not match final wording requirements.

## After
- Added shared selection style utility in [src/utils/selectionVisualUtils.ts](src/utils/selectionVisualUtils.ts).
- Manual and list/card modules now consume shared selection ring constants:
  - [src/components/modules/SubjectCard/SubjectCard.tsx](src/components/modules/SubjectCard/SubjectCard.tsx)
  - [src/components/modules/FolderCard/FolderCard.tsx](src/components/modules/FolderCard/FolderCard.tsx)
  - [src/components/modules/ListViewItem.tsx](src/components/modules/ListViewItem.tsx)
- Bin surfaces now dim unselected entries with brightness/saturation classes (no opacity dim):
  - [src/pages/Home/components/bin/BinGridItem.tsx](src/pages/Home/components/bin/BinGridItem.tsx)
  - [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx)
- Bin sort labels renamed to required wording in [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx).
- Added targeted regression coverage in [tests/unit/components/BinGridItem.test.jsx](tests/unit/components/BinGridItem.test.jsx).

## Validation
- Passed: `npm run test -- tests/unit/components/BinGridItem.test.jsx tests/unit/components/BinSelectionOverlay.test.jsx tests/unit/pages/home/binViewUtils.test.js`
- Executed: `npm run test:e2e -- tests/e2e/bin-view.spec.js` (environment-gated skip, no runtime failure)
- Passed: `get_errors` clean on touched source/test files.

## Notes
- Changes remain UI-only and do not modify backend behavior, permissions, or Firestore schema.
- Dimming behavior differentiates folder vs subject values to preserve folder readability.
