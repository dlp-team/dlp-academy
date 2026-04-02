<!-- copilot/explanations/temporal/lossless-reports/2026-04-02/phase-05-history-retirement-slice-02.md -->

# Lossless Report - Phase 05 Slice 02 (History Retirement on Home)

## Requested Scope
1. Continue Phase 05 by retiring Home history mode and send-to-history pathways.
2. Remove history persistence restoration so stale saved view preferences recover safely.
3. Keep Home grouped/manual behavior consistent after retirement and validate with deterministic tests.

## Preserved Behaviors
- Existing Home mode-switch reset behavior (selected tags, collapsed groups, current folder reset) remains unchanged.
- Existing `shared` and `bin` mode availability rules remain unchanged (including student-mode `bin` exclusion).
- Existing Home drag-and-drop, selection mode, and card visual-state wiring remain unchanged.
- Subject/folder card/list components keep completion action capability where provided by other contexts; this slice only removed Home-level wiring.

## Touched Files
- `src/pages/Home/hooks/useHomeControlsHandlers.ts`
- `src/pages/Home/components/HomeControls.tsx`
- `src/pages/Home/hooks/useHomePageState.tsx`
- `src/hooks/useHomeState.ts`
- `src/pages/Home/components/HomeContent.tsx`
- `src/pages/Home/components/HomeMainContent.tsx`
- `tests/unit/hooks/useHomeState.completionTracking.test.js`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/README.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/strategy-roadmap.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/phases/phase-05-academic-year-governance-and-courses-ux-overhaul.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/subplans/subplan-04-academic-year-and-courses-lifecycle.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/working/execution-log-2026-04-02.md`
- `copilot/plans/active/institution-governance-and-academic-lifecycle-overhaul/reviewing/verification-checklist-2026-04-02.md`
- `copilot/explanations/codebase/src/pages/Home/hooks/useHomeControlsHandlers.md`
- `copilot/explanations/codebase/src/pages/Home/components/HomeControls.md`
- `copilot/explanations/codebase/src/pages/Home/hooks/useHomePageState.md`
- `copilot/explanations/codebase/src/pages/Home/hooks/useHomeState.md`
- `copilot/explanations/codebase/src/pages/Home/components/HomeContent.md`
- `copilot/explanations/codebase/src/pages/Home/components/HomeMainContent.md`
- `copilot/explanations/codebase/tests/unit/hooks/useHomeState.completionTracking.test.md`

## Per-File Verification Notes
- `useHomeControlsHandlers.ts`:
  - Removed `history` from `HOME_VIEW_MODES` while preserving existing mode-switch reset side effects.
- `HomeControls.tsx`:
  - Removed history icon mapping and rendered tab entry through updated `HOME_VIEW_MODES`.
- `useHomePageState.tsx`:
  - Removed `history` from allowed persisted view modes so unsupported stored values fall back to supported defaults.
- `useHomeState.ts`:
  - Removed history-only grouping path and completion-based exclusion branch from regular grouping flow.
  - Maintained standard grouped output for manual and grouped modes with completed subjects included.
- `HomeContent.tsx`:
  - Removed Home completion props and completion callback pass-through to card/list subject renderers.
- `HomeMainContent.tsx`:
  - Removed completion prop forwarding into `HomeContent`.
- `useHomeState.completionTracking.test.js`:
  - Updated expectations to validate completed-subject visibility and stale-history fallback behavior.

## Validation Summary
- `get_errors` on touched source and test files -> clean.
- Focused tests:
  - `npm run test -- tests/unit/hooks/useHomeState.completionTracking.test.js` -> PASS (2 tests).
- `npm run lint` -> PASS with pre-existing warnings only in unrelated `src/pages/Content/*` files.
- `npx tsc --noEmit` -> PASS.

## Residual Risks
- Home completion actions are now unwired from Home surfaces by design; if any other feature still expects in-Home completion toggles, it must be reintroduced through a new approved UX path.
- Remaining Phase 05 items (courses-year filter persistence, multi-year collapsibles, role-aware ended indicators) are still pending.
