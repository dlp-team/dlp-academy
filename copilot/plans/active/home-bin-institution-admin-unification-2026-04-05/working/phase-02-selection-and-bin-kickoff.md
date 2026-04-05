<!-- copilot/plans/active/home-bin-institution-admin-unification-2026-04-05/working/phase-02-selection-and-bin-kickoff.md -->
# Phase 02 Kickoff - Selection and Bin Unification

## Scope Slice
- Align Home and Bin selection emphasis contracts with shared style utilities.
- Ship first Bin grid focus refinement (without touching list-mode bulk-action semantics yet).
- Add deterministic regression coverage for updated selection utilities and overlay timing.

## First Batch Candidate Files
- [src/utils/selectionVisualUtils.ts](src/utils/selectionVisualUtils.ts)
- [src/pages/Home/components/HomeContent.tsx](src/pages/Home/components/HomeContent.tsx)
- [src/pages/Home/components/bin/BinSelectionOverlay.tsx](src/pages/Home/components/bin/BinSelectionOverlay.tsx)
- [tests/unit/components/BinSelectionOverlay.test.jsx](tests/unit/components/BinSelectionOverlay.test.jsx)
- [tests/unit/utils/selectionVisualUtils.test.js](tests/unit/utils/selectionVisualUtils.test.js)

## Guardrails
- Preserve Home/Bin selection semantics (toggle behavior, selected-key generation, bulk flows).
- Keep permission and role gating behavior untouched.
- Avoid introducing asynchronous test flakiness when validating delayed panel reveal.

## Validation Plan
- Targeted tests:
  - [tests/unit/utils/selectionVisualUtils.test.js](tests/unit/utils/selectionVisualUtils.test.js)
  - [tests/unit/components/BinSelectionOverlay.test.jsx](tests/unit/components/BinSelectionOverlay.test.jsx)
  - [tests/unit/components/BinGridItem.test.jsx](tests/unit/components/BinGridItem.test.jsx)
  - [tests/unit/pages/home/HomeMainContent.test.jsx](tests/unit/pages/home/HomeMainContent.test.jsx)
- Static checks:
  - `npm run lint`
  - `npx tsc --noEmit`

## Status Log
- 2026-04-05: Phase 02 Block A implemented.
  - Home grid selection mode now dims unselected cards via shared helper.
  - Bin overlay now removes blur backdrop, adds card focus transition, and reveals panel after transition start.
  - Added deterministic utility and overlay tests with timer-driven assertions.
  - Validation passed for targeted tests, lint, and typecheck.
- 2026-04-05: Phase 02 Block B implemented.
  - Bin list selected-item actions now render inline under the selected row.
  - Removed bottom-of-list list-mode action aside.
  - Added focused inline-panel tests for selection changes and selection-mode suppression.
  - Validation passed for targeted tests, lint, and typecheck.
