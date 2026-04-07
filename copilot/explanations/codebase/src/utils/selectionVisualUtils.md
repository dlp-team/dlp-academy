<!-- copilot/explanations/codebase/src/utils/selectionVisualUtils.md -->
# selectionVisualUtils.ts

## Overview
- **Source file:** `src/utils/selectionVisualUtils.ts`
- **Last documented:** 2026-04-05
- **Role:** Centralizes shared selection ring plus Home/Bin dimming style tokens to keep selection emphasis parity.

## Responsibilities
- Exposes `SHARED_SELECTION_RING_CLASS` so selection outlines are consistent across card/list/bin surfaces.
- Exposes `getHomeUnselectedDimmingClass(...)` for Home selection mode so unselected cards lose saturation when any selection exists.
- Exposes `getBinUnselectedDimmingClass(...)` to dim unselected bin cards using brightness/saturation (without opacity-based legibility loss).

## Exports
- `SHARED_SELECTION_RING_CLASS`
- `getHomeUnselectedDimmingClass`
- `getBinUnselectedDimmingClass`

## Consumers
- `src/components/modules/SubjectCard/SubjectCard.tsx`
- `src/components/modules/FolderCard/FolderCard.tsx`
- `src/components/modules/ListViewItem.tsx`
- `src/pages/Home/components/bin/BinGridItem.tsx`
- `src/pages/Home/components/BinView.tsx`
- `src/pages/Home/components/HomeContent.tsx`

## Changelog
### 2026-04-07
- Softened bin subject dimming token from `brightness-[0.88] saturate-[0.58]` to `brightness-[0.91] saturate-[0.66]` for less aggressive background fade while preserving folder-specific dimming values.

### 2026-04-05
- Added `getHomeUnselectedDimmingClass` and integrated it into Home grid selection rendering for Phase 02 Block A.

### 2026-04-04
- Added utility as part of Phase 08 to unify manual/bin selection visuals and remove opacity dimming from bin unselected items.
