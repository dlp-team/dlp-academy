<!-- copilot/plans/todo/home-binview-refactor-2026-04-18/phases/phase-07-validation-optimization-closure.md -->
# Phase 07: Validation, Optimization & Closure

## Status: `todo`

## Objective
Final validation pass, optimization review, documentation updates, and plan closure.

## Optimization Checklist (MANDATORY per skill)
- [ ] Centralize/unify repeated logic across new modules
- [ ] Verify no duplicated helper functions across hooks/components
- [ ] Improve naming consistency (props, handlers, types)
- [ ] Apply efficiency improvements where safe
- [ ] `npm run lint` — 0 errors on all touched files
- [ ] `npx tsc --noEmit` — passes cleanly
- [ ] `npm run test` — all tests pass

## Deep Risk Analysis
- [ ] Selection state integrity across component boundaries
- [ ] Ref forwarding for overlay positioning still works
- [ ] Bulk action loading states propagate correctly
- [ ] Folder trail navigation maintains state through back/forward
- [ ] Auto-retention purge still triggers on load
- [ ] Error messages display and dismiss correctly
- [ ] No memory leaks from unmounted component state updates

## Documentation
- [ ] Create lossless report in `copilot/explanations/temporal/lossless-reports/2026-04-18/`
- [ ] Update `copilot/explanations/codebase/src/pages/Home/` documentation
- [ ] Update out-of-scope-risk-log.md — mark BinView entry as CLOSED

## Closure
- [ ] Move plan folder from `todo/` → `active/` → `inReview/` → `finished/`
- [ ] Final commit: `docs(plan): close home-binview-refactor-2026-04-18`
