<!-- copilot/explanations/codebase/src/utils/coursePromotionOrderUtils.md -->
# coursePromotionOrderUtils.ts

## Overview
- Source file: `src/utils/coursePromotionOrderUtils.ts`
- Last documented: 2026-04-05
- Role: Frontend utility layer for deterministic institution course hierarchy ordering and persistence-safe normalization.

## Responsibilities
- Normalizes course labels and removes duplicates case/diacritic-insensitively.
- Builds deterministic default promotion order aligned to Spanish academic naming heuristics (Bachillerato > ESO > Primaria > Infantil, then level descending).
- Merges persisted institution order with currently available active course labels.
- Produces persistence-safe `coursePromotionOrder` arrays for settings save payloads.

## Exports
- `normalizeCoursePromotionOrder`
- `buildDefaultCoursePromotionOrder`
- `mergeCoursePromotionOrderWithCourseNames`

## Changelog
- 2026-04-05: Added utility module to support non-duplicated drag-order settings and deterministic fallback ordering for promotion workflows.
