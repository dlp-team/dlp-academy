<!-- copilot/plans/active/original-plan-autopilot-execution-2026-04-03/strategy-roadmap.md -->
# Strategy Roadmap

## Phase Sequence and Status
1. COMPLETED - Codebase audit and dependency mapping
2. COMPLETED - Copilot governance and regular Git logging enforcement
3. COMPLETED - Selection Mode UX unification (Home + Bin multi-select)
4. COMPLETED - Settings auth enhancements (provider-linked password + Remember Me)
5. COMPLETED - Dashboard pagination rollout
6. COMPLETED - Institution Admin layout fixes + customization preview architecture audit
7. COMPLETED - Institution Admin preview 2.0 implementation (deep interactive mock replica)
8. COMPLETED - Element logic bug fixes and subject-save false error deep debug
9. COMPLETED - Real E2E validation and stabilization
10. COMPLETED - Docs sync, lossless reporting, review gate, and closure

## Dependency Order Rationale
- Governance first to enforce execution discipline and commit/push logging while implementing all other phases.
- Selection/Auth/Pagination before deep preview to stabilize baseline UX and shared primitives.
- Institution preview architecture audit before implementation to avoid wasteful rework.
- Bug-fix phase after core UI/auth scaffolding to reduce interaction churn.
- E2E and closure at end with targeted re-runs during each phase.

## Immediate Next Actions
- Ready for lifecycle transition from `active` to `inReview` and then `finished` once final sign-off is confirmed.

## Validation Gates
- Per phase: `get_errors` for touched files.
- Per feature block: targeted tests (unit/integration/e2e where relevant).
- Before phase complete: `npm run lint`, `npx tsc --noEmit`, impacted tests.
- Before plan `inReview`: `npm run test`, `npm run test:e2e` (or documented env-gated rationale).

## Rollback Strategy
- Keep changes in small, logical commits so each feature block can be reverted independently.
- Avoid broad refactors in same commit as bug fixes.
- For high-risk areas (deletion/auth flows), isolate service-level and UI-level changes.
