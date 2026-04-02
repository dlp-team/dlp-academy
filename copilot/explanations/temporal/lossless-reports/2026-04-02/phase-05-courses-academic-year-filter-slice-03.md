<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-05-courses-academic-year-filter-slice-03.md -->

# Lossless Report - Phase 05 Slice 03 (Courses Academic-Year Range Filter Baseline)

## Requested Scope
1. Continue Phase 05 by implementing courses-tab academic-year filter persistence next to `Filtrar`.
2. Add existing-years-only academic-year range selection with paginated UI.
3. Apply selected range to courses grouping output while preserving existing Home behavior.

## Preserved Behaviors
- Existing Home modes (`grid`, `usage`, `courses`, `shared`, `bin`) and mode-switch reset flow remain unchanged.
- Existing shared-scope/tag filtering flow remains unchanged.
- Existing Home drag/drop, selection-mode, and bin behavior remain unchanged.
- Existing history-retirement behavior from Slice 02 remains unchanged.

## Touched Files
- `src/hooks/useHomeState.ts`
- `src/components/ui/AcademicYearRangeFilter.tsx` (new)
- `src/pages/Home/components/HomeControls.tsx`
- `src/pages/Home/hooks/useHomeControlsHandlers.ts`
- `src/pages/Home/hooks/useHomeLogic.ts`
- `src/pages/Home/Home.tsx`
- `src/pages/Home/components/HomeContent.tsx`
- `src/hooks/useHomeHandlers.ts`
- `tests/unit/hooks/useHomeState.academicYearFilter.test.js` (new)
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/README.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/strategy-roadmap.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-05-academic-year-governance-and-courses-ux-overhaul.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/subplans/subplan-04-academic-year-and-courses-lifecycle.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/working/execution-log-2026-04-02.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/reviewing/verification-checklist-2026-04-02.md`
- `copilot/explanations/codebase/src/pages/Home/components/HomeControls.md`
- `copilot/explanations/codebase/src/pages/Home/hooks/useHomeControlsHandlers.md`
- `copilot/explanations/codebase/src/pages/Home/hooks/useHomeState.md`
- `copilot/explanations/codebase/src/pages/Home/components/HomeContent.md`
- `copilot/explanations/codebase/src/pages/Home/hooks/useHomeLogic.md`
- `copilot/explanations/codebase/src/pages/Home/Home.md`
- `copilot/explanations/codebase/src/hooks/useHomeHandlers.md`
- `copilot/explanations/codebase/src/components/ui/AcademicYearRangeFilter.md` (new)
- `copilot/explanations/codebase/tests/unit/hooks/useHomeState.academicYearFilter.test.md` (new)

## Per-File Verification Notes
- `useHomeState.ts`:
  - Added normalized persisted `coursesAcademicYearFilter` state (`startYear`/`endYear`).
  - Added available academic-year derivation for courses-tab filter options.
  - Added range-based courses grouping filter logic.
  - Added multi-year bucket label suffix behavior when multiple academic years are visible.
- `AcademicYearRangeFilter.tsx`:
  - Added reusable selector card with start/end targeting and pagination (`10` years per page).
- `HomeControls.tsx` + `useHomeControlsHandlers.ts` + `useHomeLogic.ts` + `Home.tsx`:
  - Added end-to-end wiring to render, update, and persist courses academic-year range selection.
- `HomeContent.tsx` + `useHomeHandlers.ts`:
  - Added courses default-collapsed behavior via explicit toggle-state inversion.
  - Sanitized grouped course labels (with year suffix) before create-subject prefills.
- `useHomeState.academicYearFilter.test.js`:
  - Added deterministic coverage for available-year derivation, multi-year labels, and single-year range filtering.

## Validation Summary
- `get_errors` on touched source and test files -> clean.
- Focused tests:
  - `npm run test -- tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/hooks/useHomeState.completionTracking.test.js` -> PASS (4 tests).
- `npm run lint` -> PASS with pre-existing warnings only in unrelated `src/pages/Content/*` files.
- `npx tsc --noEmit` -> PASS.

## Residual Risks
- Multi-year rendering currently appends year suffixes to course buckets and defaults them collapsed; explicit year-wrapper nested collapsibles are still pending as a final Phase 05 refinement.
- Role-aware ended-subject indicators (teacher/student color semantics) remain pending Phase 05 scope.
