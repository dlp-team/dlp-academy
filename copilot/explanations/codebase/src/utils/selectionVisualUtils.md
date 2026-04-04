<!-- copilot/explanations/codebase/src/utils/selectionVisualUtils.md -->
# selectionVisualUtils.ts

## Overview
- **Source file:** `src/utils/selectionVisualUtils.ts`
- **Last documented:** 2026-04-04
- **Role:** Centralizes shared selection ring and bin dimming style tokens to keep manual/bin visual parity.

## Responsibilities
- Exposes `SHARED_SELECTION_RING_CLASS` so selection outlines are consistent across card/list/bin surfaces.
- Exposes `getBinUnselectedDimmingClass(...)` to dim unselected bin cards using brightness/saturation (without opacity-based legibility loss).

## Exports
- `SHARED_SELECTION_RING_CLASS`
- `getBinUnselectedDimmingClass`

## Consumers
- `src/components/modules/SubjectCard/SubjectCard.tsx`
- `src/components/modules/FolderCard/FolderCard.tsx`
- `src/components/modules/ListViewItem.tsx`
- `src/pages/Home/components/bin/BinGridItem.tsx`
- `src/pages/Home/components/BinView.tsx`

## Changelog
### 2026-04-04
- Added utility as part of Phase 08 to unify manual/bin selection visuals and remove opacity dimming from bin unselected items.
