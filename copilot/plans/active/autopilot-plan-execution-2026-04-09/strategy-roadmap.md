<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/strategy-roadmap.md -->
# Strategy Roadmap

## Objective
Execute the new AUTOPILOT request with strict lossless behavior preservation, measurable validation gates, and full checklist-driven traceability.

## Phase Map
1. Phase 00: Intake, delta mapping, baseline references, and source ingestion
2. Phase 01: Selection mode batch drag/drop parity and list-border clipping fix
3. Phase 02: Batch move confirmation + global undo pipeline hardening
4. Phase 03: Bin section grid/list press-state parity and no-duplication interaction fixes
5. Phase 04: Keyboard shortcuts ownership, deep-copy semantics, and undo parity
6. Phase 05: Institution customization preview parity, reset-to-saved behavior, and saved theme sets
7. Phase 06: Global scrollbar and undo-card visual refinements
8. Phase 07: Notification delivery/placement styling parity (toast + history)
9. Phase 08: Final optimization and deep risk analysis
10. Final Phase: Continue autopilot execution checklist from Step 7 onward

## Current Progress
- Phase 00: COMPLETED
- Phase 01: IN_PROGRESS
- Phase 02: PLANNED
- Phase 03: IN_REVIEW
- Phase 04: PLANNED
- Phase 05: PLANNED
- Phase 06: IN_REVIEW
- Phase 07: IN_REVIEW
- Phase 08: PLANNED
- Final Phase: PLANNED

## Dependency Order
- Phase 02 depends on action handlers and selection semantics stabilized in Phase 01.
- Phase 03 depends on shared interaction utilities validated in Phases 01-02.
- Phase 04 depends on robust undo contracts from Phase 02.
- Phase 05 should run after interaction-stack stabilization to avoid noisy regressions.
- Phase 06-07 use finalized theme and notification primitives from earlier phases.
- Phase 08 closes with optimization + deep-risk and promotion gates.

## Validation by Phase
- Every phase must include `get_errors` on touched files.
- Cross-cutting phases (02, 04, 05, 07) require targeted tests plus `npm run lint` and `npx tsc --noEmit`.
- Final phase requires full `npm run test` and `npm run build` before closure gate.

## Immediate Next Actions
1. Complete pending core interaction phases (01, 02, 04, 05).
2. Run manual parity checks for Phase 03/06/07 and promote statuses when all criteria pass.
3. Continue checklist-driven execution and keep branch/plan evidence synchronized.
