<!-- copilot/plans/todo/home-binview-refactor-2026-04-18/README.md -->
# Plan: BinView.tsx Component Refactor

## Status: `active` (implementation complete, pending final review)
## Created: 2026-04-18
## Origin: [copilot/plans/out-of-scope-risk-log.md](copilot/plans/out-of-scope-risk-log.md) — Entry dated 2026-04-28

---

## Problem Statement

[src/pages/Home/components/BinView.tsx](src/pages/Home/components/BinView.tsx) is **1052 lines**, exceeding the project's ~500-line split threshold. The file combines:

1. **State management** (~20 useState hooks + multiple useMemo computations)
2. **Data loading** (async `loadTrashedItems` with auto-retention purge logic)
3. **Action handlers** (restore, permanent delete, bulk operations, folder navigation)
4. **Render: toolbar** (sort selector, breadcrumb, empty-bin button)
5. **Render: selection toolbar** (bulk mode toggle, select-all, bulk restore/delete)
6. **Render: grid/list item views** (full grid layout + list layout with inline action panels)
7. **Render: overlay + modals** (BinSelectionOverlay, DeleteConfirmModal, EmptyBinConfirmModal)

## Scope

Extract distinct concerns into focused modules while preserving **100% of existing behavior** (lossless).

## Existing Extraction

Several subcomponents already live in `src/pages/Home/components/bin/`:
- `BinGridItem.tsx` — Grid card renderer
- `BinSelectionOverlay.tsx` — Overlay for selected item (grid mode)
- `BinConfirmModals.tsx` — Delete and empty-bin confirm modals
- `BinDescriptionModal.tsx` — Description modal
- `BinSelectionPanel.tsx` — Selection panel

Utilities already extracted to `src/pages/Home/utils/binViewUtils.ts`.

## Target Architecture

After refactoring, BinView.tsx should be ≤ 300 lines of orchestration-only code that imports:

| New Module | Location | Responsibility |
|---|---|---|
| `useBinData` | `src/hooks/useBinData.ts` | State, data fetching, auto-retention purge, memoized derived lists |
| `useBinActions` | `src/hooks/useBinActions.ts` | All action handlers (restore, delete, bulk ops, folder nav, selection) |
| `BinToolbar` | `src/pages/Home/components/bin/BinToolbar.tsx` | Sort selector, breadcrumb, empty-bin button |
| `BinSelectionToolbar` | `src/pages/Home/components/bin/BinSelectionToolbar.tsx` | Bulk mode toggle, select-all, count badge, bulk action buttons |
| `BinListItem` | `src/pages/Home/components/bin/BinListItem.tsx` | Single list-view item with urgency badges + inline action panel |

## Success Criteria

- [ ] BinView.tsx ≤ 300 lines
- [ ] All existing bin flows work identically (grid, list, selection, bulk, folder drill-down, restore, delete, empty bin)
- [ ] No new visual regressions
- [ ] `npm run lint` clean on all touched files
- [ ] `npx tsc --noEmit` passes
- [ ] Existing tests pass (`npm run test`)
- [ ] Lossless report created

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Broken selection state across components | Keep state in hooks, pass down via props — validate with manual QA |
| Ref forwarding for overlay positioning | `selectedCardRef` stays in BinView and is passed to BinGridItem |
| Circular hook dependencies | useBinActions receives useBinData return values as params, no circular imports |
| List-mode inline panel losing context | BinListItem receives all handlers as props |

## Files Touched

- `src/pages/Home/components/BinView.tsx` (major refactor)
- `src/hooks/useBinData.ts` (new)
- `src/hooks/useBinActions.ts` (new)
- `src/pages/Home/components/bin/BinToolbar.tsx` (new)
- `src/pages/Home/components/bin/BinSelectionToolbar.tsx` (new)
- `src/pages/Home/components/bin/BinListItem.tsx` (new)

## Related Documentation

- [copilot/explanations/codebase/src/pages/Home/utils/binViewUtils.md](copilot/explanations/codebase/src/pages/Home/utils/binViewUtils.md)
