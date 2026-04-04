<!-- copilot/explanations/temporal/lossless-reports/2026-04-04/phase-08-bin-selection-mode-unification.md -->
# Lossless Review Report - Phase 08 Bin Selection Mode Unification

## Requested Scope
- Unify selection visuals between manual and bin surfaces.
- Replace opacity dimming with brightness/saturation dimming for unselected bin items when a selection exists.
- Keep folder readability in dimmed states.
- Rename bin urgency sort labels to `Urgencia: Ascendente` and `Urgencia: Descendente`.

## Preserved Behaviors Checklist
- Bin restore/delete behavior and modal flows remain unchanged in [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx).
- Bin selection overlay behavior remains unchanged in [src/pages/Home/components/bin/BinSelectionOverlay.tsx](src/pages/Home/components/bin/BinSelectionOverlay.tsx).
- Existing bin sort algorithms remain unchanged in [src/pages/Home/utils/binViewUtils.ts](src/pages/Home/utils/binViewUtils.ts).
- Existing manual selection interactions remain intact while style tokens are centralized.

## Touched Files
- [src/utils/selectionVisualUtils.ts](src/utils/selectionVisualUtils.ts)
- [src/components/modules/SubjectCard/SubjectCard.tsx](src/components/modules/SubjectCard/SubjectCard.tsx)
- [src/components/modules/FolderCard/FolderCard.tsx](src/components/modules/FolderCard/FolderCard.tsx)
- [src/components/modules/ListViewItem.tsx](src/components/modules/ListViewItem.tsx)
- [src/pages/Home/components/bin/BinGridItem.tsx](src/pages/Home/components/bin/BinGridItem.tsx)
- [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx)
- [tests/unit/components/BinGridItem.test.jsx](tests/unit/components/BinGridItem.test.jsx)
- [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-08-bin-selection-mode-unification-planned.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/phases/phase-08-bin-selection-mode-unification-planned.md)
- [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/strategy-roadmap.md)
- [copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/README.md](copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/README.md)
- [copilot/explanations/codebase/src/utils/selectionVisualUtils.md](copilot/explanations/codebase/src/utils/selectionVisualUtils.md)
- [copilot/explanations/codebase/src/pages/Home/components/BinView.md](copilot/explanations/codebase/src/pages/Home/components/BinView.md)
- [copilot/explanations/codebase/src/pages/Home/components/bin/BinGridItem.md](copilot/explanations/codebase/src/pages/Home/components/bin/BinGridItem.md)
- [copilot/explanations/codebase/src/components/modules/SubjectCard/SubjectCard.md](copilot/explanations/codebase/src/components/modules/SubjectCard/SubjectCard.md)
- [copilot/explanations/codebase/src/components/modules/FolderCard/FolderCard.md](copilot/explanations/codebase/src/components/modules/FolderCard/FolderCard.md)
- [copilot/explanations/codebase/src/components/modules/ListViewItem.md](copilot/explanations/codebase/src/components/modules/ListViewItem.md)
- [copilot/explanations/codebase/tests/unit/components/BinGridItem.test.md](copilot/explanations/codebase/tests/unit/components/BinGridItem.test.md)
- [copilot/explanations/temporal/institution-admin/phase-08-bin-selection-mode-unification-2026-04-04.md](copilot/explanations/temporal/institution-admin/phase-08-bin-selection-mode-unification-2026-04-04.md)

## File-by-File Verification
- [src/utils/selectionVisualUtils.ts](src/utils/selectionVisualUtils.ts): centralized shared ring class and non-opacity dimming helper.
- [src/components/modules/SubjectCard/SubjectCard.tsx](src/components/modules/SubjectCard/SubjectCard.tsx): consumes shared ring class without changing event/drag behavior.
- [src/components/modules/FolderCard/FolderCard.tsx](src/components/modules/FolderCard/FolderCard.tsx): consumes shared ring class without changing drop logic.
- [src/components/modules/ListViewItem.tsx](src/components/modules/ListViewItem.tsx): consumes shared ring class for list-row parity.
- [src/pages/Home/components/bin/BinGridItem.tsx](src/pages/Home/components/bin/BinGridItem.tsx): selected ring parity + folder/subject-safe dimming classes + wrapper test id.
- [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx): urgency label rename and list-mode dimming + selected style parity wiring.
- [tests/unit/components/BinGridItem.test.jsx](tests/unit/components/BinGridItem.test.jsx): adds deterministic assertions for selected style and dimming semantics.

## Validation Summary
- `get_errors` clean for touched source/test files.
- Passed: `npm run test -- tests/unit/components/BinGridItem.test.jsx tests/unit/components/BinSelectionOverlay.test.jsx tests/unit/pages/home/binViewUtils.test.js`.
- Executed: `npm run test:e2e -- tests/e2e/bin-view.spec.js` (2 skipped by environment gate; no runtime failures).

## Risk Review
- Residual risk: future ring-token changes may affect both manual and bin surfaces simultaneously due centralization.
- Control: focused `BinGridItem` regression tests plus existing overlay/utils tests now guard parity semantics.
