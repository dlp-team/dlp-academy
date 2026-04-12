<!-- copilot/plans/todo/autopilot-plan-scrollbar-execution-2026-04-12/reviewing/verification-checklist-2026-04-12.md -->
# Verification Checklist (2026-04-12)

## Functional
- [ ] Selection-mode grouped drag and drop moves all selected elements together.
- [ ] Grouped drag ghost includes selected stack behavior (not only origin item).
- [ ] Ctrl+click starts selection mode and selects current item when mode is off.
- [ ] Ctrl+click in selection mode navigates into folder/subject while preserving selection mode.
- [ ] Ctrl+Shift+click selects contiguous range between anchor and target.
- [ ] Batch action confirmation copy lists names up to 5 and then summarizes overflow.
- [ ] Batch undo restores all affected elements, not only first/last item.
- [ ] Bin grid second-click no longer causes badge flicker/invisibility.
- [ ] Bin list mode no longer dims/saturates non-selected siblings on press.
- [ ] Customization preview header no longer shows internal teacher selector.
- [ ] Teacher/student preview routes show role-specific mock dashboards.
- [ ] Color swatch interaction opens picker in active and inactive states.
- [ ] Preview updates color live before save and persists only on save.
- [ ] Global scrollbar style is stable and updates live on theme switch.

## Non-Functional
- [ ] `get_errors` clean on touched files.
- [ ] `npm run lint` clean for touched scope.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run test` passes for impacted scope.
- [ ] `npm run build` succeeds.

## Governance
- [ ] Commit/push branch rule verified in protocol, skill, and checklist sources.
- [ ] No commit/push occurred on `main`.
- [ ] Security scans (`security:scan:staged`, `security:scan:branch`) pass for each commit block.