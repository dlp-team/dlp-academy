<!-- copilot/plans/todo/home-binview-refactor-2026-04-18/reviewing/review-checklist.md -->
# Review Checklist: BinView Refactor

## Optimization & Consolidation Review
- [ ] No duplicated logic across `useBinData`, `useBinActions`, and extracted components
- [ ] File sizes are within threshold (each new file < 300 lines, BinView.tsx ≤ 300 lines)
- [ ] Import paths are clean (no circular dependencies)
- [ ] Naming conventions consistent with DLP Academy patterns
- [ ] `npm run lint` — 0 errors across all touched files
- [ ] `npx tsc --noEmit` — passes cleanly

## Deep Risk Analysis Review
- [ ] Selection state: single-select, bulk-select, deselect flows work in both grid and list modes
- [ ] Folder navigation: drill-down and back-navigation maintain correct trail state
- [ ] Auto-retention purge: fires on initial load, correctly deletes expired items
- [ ] Bulk operations: partial failures show correct error messages with counts
- [ ] Overlay positioning: `selectedCardRef` correctly positions the BinSelectionOverlay
- [ ] Student access denial: still blocks bin access for student role
- [ ] Error/loading/empty states: all render correctly
- [ ] No console.log debug statements left behind

## Final Sign-Off
- [ ] All phase checklists marked complete
- [ ] Lossless report created and documented
- [ ] Out-of-scope risk log updated (BinView entry → CLOSED)
- [ ] Plan moved to `finished/`
