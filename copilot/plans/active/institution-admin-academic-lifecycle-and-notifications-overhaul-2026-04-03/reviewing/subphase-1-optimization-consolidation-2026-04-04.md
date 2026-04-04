<!-- copilot/plans/active/institution-admin-academic-lifecycle-and-notifications-overhaul-2026-04-03/reviewing/subphase-1-optimization-consolidation-2026-04-04.md -->
# InReview Subphase 1 - Optimization and Consolidation (2026-04-04)

## Objective
Consolidate recently shipped implementation slices (Phases 05-09) to reduce duplication, align style contracts, and ensure deterministic validation artifacts.

## Completed Consolidation Items
- Centralized selection-ring and bin-dimming style contracts in [src/utils/selectionVisualUtils.ts](src/utils/selectionVisualUtils.ts).
- Rewired manual/bin selection consumers to shared style contracts:
  - [src/components/modules/SubjectCard/SubjectCard.tsx](src/components/modules/SubjectCard/SubjectCard.tsx)
  - [src/components/modules/FolderCard/FolderCard.tsx](src/components/modules/FolderCard/FolderCard.tsx)
  - [src/components/modules/ListViewItem.tsx](src/components/modules/ListViewItem.tsx)
  - [src/pages/Home/components/bin/BinGridItem.tsx](src/pages/Home/components/bin/BinGridItem.tsx)
  - [src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx)
- Consolidated transfer e2e evidence into both mock and non-mock execution-path runs in [tests/e2e/transfer-promotion.spec.js](tests/e2e/transfer-promotion.spec.js).
- Reduced type-gate churn by aligning access policy and env typing contracts in:
  - [src/utils/institutionPolicyUtils.ts](src/utils/institutionPolicyUtils.ts)
  - [src/global.d.ts](src/global.d.ts)

## Validation Evidence
- `npm run lint` -> PASS
- `npx tsc --noEmit` -> PASS
- `npm run test` -> PASS (134 files, 606 tests)
- Non-mock transfer e2e execution path -> PASS (`3 passed`)

## Result
- Subphase 1 complete.
- No optimization regressions detected in current gate evidence.
