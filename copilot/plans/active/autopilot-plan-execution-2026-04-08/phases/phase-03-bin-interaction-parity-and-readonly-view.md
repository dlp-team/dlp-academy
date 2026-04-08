<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/phases/phase-03-bin-interaction-parity-and-readonly-view.md -->
# Phase 03 - Bin Interaction Parity and Read-Only View

## Status
- IN_REVIEW

## Objective
Make bin interaction behavior consistent in grid/list and ensure "Ver contenido" opens a read-only flow.

## Scope
- Soften pressed background opacity.
- Remove delayed options reveal.
- Border highlight only when bin selection mode is active.
- Non-selection press style via card scale in both modes.
- Read-only navigation from bin "Ver contenido" with mutation blocked.

## Validation
- Visual parity checks across grid/list.
- Read-only action guard verification.
- `get_errors` and targeted behavior tests.

## Implemented (2026-04-08)
- Removed delayed options reveal in grid selection overlay and kept side panel available immediately.
- Softened pressed backdrop opacity to preserve selected-card context.
- Limited strong selection-ring highlight to explicit bin selection mode.
- Added non-selection pressed-scale parity in both grid/list experiences.
- Routed bin `Ver contenido` to read-only subject flow: `/home/subject/:id?mode=readonly&source=bin`.
- Added read-only mutation guards in Subject and Topic pages for bin-origin navigation.

## Touched Files
- [src/pages/Home/components/BinView.tsx](../../../../../src/pages/Home/components/BinView.tsx)
- [src/pages/Home/components/bin/BinSelectionOverlay.tsx](../../../../../src/pages/Home/components/bin/BinSelectionOverlay.tsx)
- [src/pages/Home/components/bin/BinGridItem.tsx](../../../../../src/pages/Home/components/bin/BinGridItem.tsx)
- [src/pages/Subject/Subject.tsx](../../../../../src/pages/Subject/Subject.tsx)
- [src/pages/Topic/Topic.tsx](../../../../../src/pages/Topic/Topic.tsx)
- [tests/unit/components/BinSelectionOverlay.test.jsx](../../../../../tests/unit/components/BinSelectionOverlay.test.jsx)
- [tests/unit/components/BinGridItem.test.jsx](../../../../../tests/unit/components/BinGridItem.test.jsx)
- [tests/unit/pages/home/BinView.listInlinePanel.test.jsx](../../../../../tests/unit/pages/home/BinView.listInlinePanel.test.jsx)
- [tests/unit/pages/subject/Subject.topicDeleteConfirm.test.jsx](../../../../../tests/unit/pages/subject/Subject.topicDeleteConfirm.test.jsx)
- [tests/unit/pages/topic/Topic.realtimeFeedback.test.jsx](../../../../../tests/unit/pages/topic/Topic.realtimeFeedback.test.jsx)

## Validation Results (2026-04-08)
- `get_errors` on touched files: PASS
- `npm run test -- tests/unit/components/BinSelectionOverlay.test.jsx tests/unit/components/BinGridItem.test.jsx tests/unit/pages/home/BinView.listInlinePanel.test.jsx tests/unit/pages/subject/Subject.topicDeleteConfirm.test.jsx tests/unit/pages/topic/Topic.realtimeFeedback.test.jsx`: PASS
- `npm run lint`: PASS
- `npx tsc --noEmit`: PASS
