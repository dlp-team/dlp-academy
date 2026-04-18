<!-- copilot/plans/todo/home-binview-refactor-2026-04-18/strategy-roadmap.md -->
# Strategy Roadmap: BinView Refactor

## Source of Truth
This file is the authoritative roadmap. Phase files provide detailed checklists.

---

## Phase Overview

| # | Phase | Status | Description |
|---|---|---|---|
| 1 | Extract `useBinData` hook | `todo` | Move all state declarations, data fetching, useMemo computations, and auto-retention purge logic into a dedicated hook |
| 2 | Extract `useBinActions` hook | `todo` | Move all action handlers (restore, delete, bulk ops, folder navigation, selection management) into a dedicated hook |
| 3 | Extract `BinToolbar` component | `todo` | Move toolbar render block (sort, breadcrumb, empty-bin button) into standalone component |
| 4 | Extract `BinSelectionToolbar` component | `todo` | Move bulk selection toolbar render block into standalone component |
| 5 | Extract `BinListItem` component | `todo` | Move list-view item rendering (with urgency badges + inline action panel) into standalone component |
| 6 | Slim down `BinView.tsx` orchestrator | `todo` | Wire all extracted modules together, remove dead code, verify ≤ 300 lines |
| 7 | Validation & optimization | `todo` | Full lint/type-check/test pass, lossless report, docs update |

---

## Execution Strategy

1. **Hook-first**: Extract data and logic hooks before touching render code. This ensures render extractions have stable prop contracts.
2. **One extraction per phase**: Each phase extracts exactly one module, commits, and validates before proceeding.
3. **Backward compatibility gate**: After each phase, BinView must still render identically—no partial states allowed.
4. **Commit cadence**: One validated commit per phase (7 commits minimum).

## Rollback Strategy

Each phase is a single-module extraction. Rollback = revert that commit. No cross-phase dependencies until Phase 6 (orchestrator slimdown).

## Testing Strategy

- After each phase: `npm run lint`, `npx tsc --noEmit`, `npm run test`
- After Phase 6: Manual verification of all bin flows (grid, list, selection, bulk, folder drill-down, restore, delete, empty bin)
- After Phase 7: Lossless report with before/after line counts and behavior verification
