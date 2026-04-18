<!-- copilot/plans/todo/home-binview-refactor-2026-04-18/phases/phase-06-slim-BinView-orchestrator.md -->
# Phase 06: Slim Down BinView.tsx Orchestrator

## Status: `todo`

## Objective
After all extractions, clean up BinView.tsx to be a pure orchestrator:
- Import and wire `useBinData`, `useBinActions`
- Import and render `BinToolbar`, `BinSelectionToolbar`, `BinListItem`
- Keep only the top-level layout, early returns (student/loading/empty), grid/list branching, overlay, and modal wiring
- Remove dead imports and unused local helpers
- Target: **≤ 300 lines**

## Checklist
- [ ] Remove all code that was extracted in Phases 1-5
- [ ] Verify no dead imports remain
- [ ] Verify `BinView.tsx` is ≤ 300 lines
- [ ] Verify BinView still compiles: `npx tsc --noEmit`
- [ ] Verify lint: `npm run lint`
- [ ] Verify tests: `npm run test`
- [ ] Manual verification of all bin flows:
  - [ ] Grid view: select item, restore, delete
  - [ ] List view: select item, inline panel, restore, delete
  - [ ] Bulk selection mode: select multiple, restore all, delete all
  - [ ] Folder drill-down: open folder, navigate back
  - [ ] Empty bin: confirm and execute
  - [ ] Sort modes: all 4 options work
  - [ ] Student access: denied screen shown
  - [ ] Empty state: correct messages for top-level and folder views
- [ ] Commit: `refactor(home): slim BinView orchestrator after extractions`
