<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-06-selection-bin-sort-admin-navigation-slice-01.md -->

# Lossless Report - Phase 06 Slice 01 (Selection/Bin UX + Admin Navigation)

## Requested Scope
1. Improve selection mode clarity and safety in Home surfaces.
2. Add bin sorting controls (urgency asc/desc, alphabetical asc/desc).
3. Add bin-only multi-select actions for mass restore and permanent delete.
4. Remove first-open top-left slide/jump behavior from Escala and Filtrar overlays.
5. Remove institution-row chevron entry icon and navigate by row click.

## Preserved Behaviors
- Existing Home tabs and role restrictions remain unchanged (`grid`, `usage`, `courses`, `shared`, `bin`).
- Existing single-item bin restore/delete and detail preview behavior remains available when selection mode is off.
- Existing folder drilldown behavior in bin remains intact.
- Existing admin row action handlers (`editar`, `deshabilitar/habilitar`, `eliminar`) remain unchanged in semantics.

## Touched Files
- `src/pages/Home/components/HomeSelectionToolbar.tsx`
- `src/pages/Home/components/BinView.tsx`
- `src/pages/Home/components/bin/BinConfirmModals.tsx`
- `src/pages/Home/utils/binViewUtils.ts`
- `src/components/ui/CardScaleSlider.tsx`
- `src/components/ui/TagFilter.tsx`
- `src/pages/AdminDashboard/components/InstitutionTableRow.tsx`
- `tests/unit/pages/home/binViewUtils.test.js`
- `tests/unit/pages/admin/InstitutionTableRow.test.jsx`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/README.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/strategy-roadmap.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-06-home-admin-ux-reliability-and-selection-mode-enhancements.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/working/execution-log-2026-04-02.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/reviewing/verification-checklist-2026-04-02.md`
- `copilot/explanations/codebase/src/pages/Home/components/BinView.md`
- `copilot/explanations/codebase/src/pages/Home/components/HomeSelectionToolbar.md`
- `copilot/explanations/codebase/src/pages/Home/components/bin/BinConfirmModals.md`
- `copilot/explanations/codebase/src/pages/Home/utils/binViewUtils.md`
- `copilot/explanations/codebase/src/components/ui/CardScaleSlider.md`
- `copilot/explanations/codebase/src/components/ui/TagFilter.md`
- `copilot/explanations/codebase/src/pages/AdminDashboard/components/InstitutionTableRow.md`
- `copilot/explanations/codebase/tests/unit/pages/home/binViewUtils.test.md`
- `copilot/explanations/codebase/tests/unit/pages/admin/InstitutionTableRow.test.md`

## Per-File Verification Notes
- `HomeSelectionToolbar.tsx`:
  - Reorganized selection actions and added explicit safety copy without changing callback contracts.
- `BinView.tsx`:
  - Added sort selector + deterministic sort mode support.
  - Added bin-only selection mode with bulk restore and confirmed bulk permanent delete.
  - Preserved existing single-item overlay behavior outside selection mode.
- `BinConfirmModals.tsx`:
  - Extended full-bin modal to support configurable title/description/confirm labels/loading for selection delete flow.
- `binViewUtils.ts`:
  - Added reusable sort constants/comparators to avoid duplicated sort logic in BinView.
- `CardScaleSlider.tsx` + `TagFilter.tsx`:
  - Precomputed panel coordinates before display to prevent initial top-left flash.
- `InstitutionTableRow.tsx`:
  - Shifted dashboard entry to row click/keyboard while action buttons stop propagation.
- Tests:
  - Added sort-mode assertions for bin utility.
  - Updated institution-row tests for row navigation and action-button isolation.

## Validation Summary
- `get_errors` on touched files -> clean.
- Targeted tests:
  - `npm run test -- tests/unit/pages/home/binViewUtils.test.js tests/unit/pages/admin/InstitutionTableRow.test.jsx` -> PASS (8 tests).
- Typecheck:
  - `npx tsc --noEmit` -> PASS.
- Lint:
  - `npm run lint` -> PASS with 4 pre-existing warnings in unrelated `src/pages/Content/*` files.

## Residual Risks
- No regressions observed in touched Home/Admin UX surfaces.
- Phase 02 emulator-backed rules validation gate remains pending external emulator startup configuration.
