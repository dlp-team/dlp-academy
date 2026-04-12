<!-- copilot/plans/active/autopilot-plan-scrollbar-execution-2026-04-12/reviewing/verification-checklist-2026-04-12.md -->
# Verification Checklist (2026-04-12)

## Functional
- [x] Selection-mode grouped drag and drop moves all selected elements together.
- [x] Grouped drag ghost includes selected stack behavior (not only origin item).
- [x] Ctrl+click starts selection mode and selects current item when mode is off.
- [x] Ctrl+click in selection mode navigates into folder/subject while preserving selection mode.
- [x] Ctrl+Shift+click selects contiguous range between anchor and target.
- [x] Batch action confirmation copy lists names up to 5 and then summarizes overflow.
- [x] Batch undo restores all affected elements, not only first/last item.
- [x] Bin grid second-click no longer causes badge flicker/invisibility.
- [x] Bin list mode no longer dims/saturates non-selected siblings on press.
- [x] Customization preview header no longer shows internal teacher selector.
- [x] Teacher/student preview routes show role-specific mock dashboards.
- [x] Color swatch interaction opens picker in active and inactive states.
- [x] Preview updates color live before save and persists only on save.
- [x] Global scrollbar style is stable and updates live on theme switch.

## Non-Functional
- [x] `get_errors` clean on touched files.
- [x] `npm run lint` clean for touched scope.
- [ ] `npx tsc --noEmit` passes.
- [x] `npm run test` passes for impacted scope.
- [x] `npm run build` succeeds.

## Validation Notes
- `npx tsc --noEmit` remains blocked by unrelated pre-existing type errors in `src/pages/Home/components/HomeContent.tsx`.
- `npm run test` full-suite run reported one intermittent `StudyGuide.navigation` assertion failure; isolated rerun passed.

## Governance
- [x] Commit/push branch rule verified in protocol, skill, and checklist sources.
- [x] No commit/push occurred on `main`.
- [x] Security scans (`security:scan:staged`, `security:scan:branch`) pass for each commit block.