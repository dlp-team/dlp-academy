<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/strategy-roadmap.md -->
# Strategy Roadmap

## Objective
Execute the AUTOPILOT request with lossless behavior preservation, deterministic sequencing, and full protocol evidence.

## Phase Map
1. Phase 00: Intake, dependency mapping, and baseline capture
2. Phase 01: Selection mode + drag/drop + selection de-duplication
3. Phase 02: Unified undo engine + reusable undo notification component
4. Phase 03: Bin section interaction parity + read-only content navigation
5. Phase 04: Institution customization UI fixes (color cards, hex input, confirmations)
6. Phase 05: Theme preview route architecture + iframe live color injection
7. Phase 06: Global scrollbar overlay + dark/light adaptation
8. Phase 07: Notification events for sharing/assignment/enrollment
9. Phase 08: Topic create-actions regression recovery from main baseline
10. Phase 09: Final optimization + deep risk analysis + closure gate

## Current Progress
- Phase 00: COMPLETED
- Phase 01: IN_PROGRESS
- Phase 02: IN_PROGRESS
- Phase 03: PLANNED
- Phase 04: PLANNED
- Phase 05: PLANNED
- Phase 06: PLANNED
- Phase 07: IN_PROGRESS
- Phase 08: IN_REVIEW
- Phase 09: PLANNED

## Dependency Order
- Phase 02 depends on baseline action handlers identified in Phase 00.
- Phase 03 uses notification and undo primitives from Phase 02.
- Phase 05 depends on completed color interaction contract from Phase 04.
- Phase 08 references baseline behavior comparison from Phase 00 and validates against later shared changes.

## Validation by Phase
- Each phase must produce an updated lossless report entry.
- Each phase must run `get_errors` for touched files.
- Cross-cutting phases (02, 05, 06, 08) require `npm run lint` + targeted tests.
- Final phase requires full `npm run test` and `npx tsc --noEmit` before closure.

## Immediate Next Actions
1. Finish remaining Phase 02 undo edge-path wiring and regression checks.
2. Complete Phase 01 remaining gate: batch move confirmation parity for all selected entries.
3. Perform manual in-app parity check for Phase 08 create-button visibility across owner/editor and mixed-role contexts, then mark Phase 08 complete.
