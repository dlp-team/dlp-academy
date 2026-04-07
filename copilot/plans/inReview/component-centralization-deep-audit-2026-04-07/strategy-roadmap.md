<!-- copilot/plans/inReview/component-centralization-deep-audit-2026-04-07/strategy-roadmap.md -->
# Strategy Roadmap

## Source of Truth
This roadmap is the authoritative sequencing and status reference for this plan.

## Phase Matrix
| Phase | Title | Status | Exit Gate |
|---|---|---|---|
| 01 | Deep inventory and duplication map | COMPLETED | Duplicates grouped by pattern, impact, and migration complexity |
| 02 | Registry reconciliation and target architecture | COMPLETED | Registry aligned to real reusable components and target architecture approved |
| 03 | Modal centralization wave | COMPLETED | High-priority custom modals migrated to shared shell with parity checks |
| 04 | Three-dots menu centralization wave | COMPLETED | Shared menu portal/position logic adopted by priority card/list surfaces |
| 05 | Button and form primitive centralization | COMPLETED | Repeated action and input patterns replaced with reusable primitives where safe |
| 06 | Final optimization and deep risk review | COMPLETED | Mandatory optimization + deep risk analysis completed |

## Execution Sequence
1. Produce exhaustive duplicate map with evidence links.
2. Reconcile registry and define target shared UI architecture.
3. Centralize modal wrappers first (highest consistency leverage).
4. Centralize repeated context-menu mechanics in card/list modules.
5. Consolidate common action/button/input patterns.
6. Execute mandatory final optimization and deep risk review.

## Deliverable Map by Phase
- Phase 01: baseline audit report with ranked duplication clusters.
- Phase 02: registry corrections + architecture decision record.
- Phase 03: modal wrapper migration set and regression checks.
- Phase 04: shared menu/portal utility or component and adopters.
- Phase 05: reusable action primitives and adoption in target screens.
- Phase 06: optimization evidence and inReview readiness report.

## Validation Gates
- Planning/docs gate: get_errors on changed plan files.
- Implementation gate per major block:
  - npm run lint
  - npm run test
  - npx tsc --noEmit (if TypeScript surface changed)
- Regression gate:
  - modal open/close and backdrop behavior
  - context-menu open/close/positioning behavior

## Escalation and Stop Conditions
- Stop if a proposed abstraction would remove permission-safe behavior.
- Stop if migration introduces unresolved regressions after 3 deterministic remediation attempts.
- Stop if scope drift starts pulling unrelated UI redesign work.

## Rollback Gates
- Roll back by validated wave, never across unrelated waves.
- Re-run lint/tests/get_errors after rollback.
- Keep registry/docs in sync with rollback state.

## Transition Rules
- todo -> active: implementation starts.
- active -> inReview: all planned waves complete and validated.
- inReview -> finished: review checklist and deep risk review pass.

## Current Session Progress
- Phase 01 completed with baseline audit artifact and prioritized duplicate clusters.
- Phase 02 completed with registry and instruction alignment to real active components.
- Phase 04 completed with shared menu-position utility plus shared portal shell adopted by all four duplicated card/list menu surfaces.
- Phase 03 completed with shared AI modal shell extraction and BaseModal migration for remaining priority targets.
- Phase 05 completed with shared PDF upload + gradient submit primitives adopted by AI modals.
- Phase 06 completed with final optimization checks, full-suite validation, and deep risk analysis evidence.
- Plan state is now ready for `inReview` -> `finished` lifecycle transition.
