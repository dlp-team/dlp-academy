<!-- copilot/plans/active/autopilot-plan-execution-2026-04-10/README.md -->
# AUTOPILOT Plan Execution (2026-04-10)

## Status
- Lifecycle: active
- Execution Mode: autopilot (checklist-driven)
- Branch: feature/autopilot-workflow-updates-2026-04-09
- Owner: hector
- Current Checklist Step: 6 (plan intake package complete)

## Source Priority
- Primary source of truth: [sources/source-autopilot-user-spec-autopilot-plan-execution-2026-04-10.md](./sources/source-autopilot-user-spec-autopilot-plan-execution-2026-04-10.md)
- This plan supersedes prior source intake content for the current request direction.
- Prior same-branch plan retained for lineage: [copilot/plans/finished/autopilot-plan-execution-2026-04-09/](../../finished/autopilot-plan-execution-2026-04-09/)
- Requirements in the source file are not weakened by this plan package.

## Mandatory Intake Compliance
- Created from user-provided AUTOPILOT_PLAN.md (root path source).
- Executed through [copilot/ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md](../../../ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md).
- Source was moved to this plan `sources/` directory with required rename.
- Root source duplicate was removed after intake.

## Pre-Plan Governance Delta (Completed)
- Updated [copilot/protocols/plan-creation-protocol.md](../../../protocols/plan-creation-protocol.md) with AUTOPILOT_PLAN trigger routing and checklist enforcement.
- Updated [.github/copilot-instructions.md](../../../../.github/copilot-instructions.md) with prompt/chat intake trigger and human merge gate.
- Updated [AGENTS.md](../../../../AGENTS.md) with intake trigger and human merge authorization gate.
- Updated [copilot/ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md](../../../ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md) with branch-log autopilot flag and merge approval gate.
- Updated [copilot/templates/BRANCH_LOG.md](../../../templates/BRANCH_LOG.md) and [BRANCH_LOG.md](../../../../BRANCH_LOG.md) with explicit `Autopilot Status` and `Merge Status` fields.

## Scope
1. Selection mode grouped drag/drop parity with grouped ghost and move behavior parity to individual drag/drop semantics.
2. Batch action undo correctness for all affected elements (move/delete/etc), including Ctrl+Z and undo card consistency.
3. Prevent selection-mode reactivation after undo and restore shared-state correctness when undoing shared-folder boundary moves.
4. Keep `Crear nueva asignatura` visible but inert while selection mode is active.
5. Fix clipped selected-border rendering in nested list mode selection flow.
6. Bin section press-state parity fixes (grid second-click flicker/invisibility, list press opacity behavior).
7. Home notification placement and delivery standardization (bottom-left non-layout-shift card, reusable centralized component).
8. Institution Admin customization preview parity with real app components, single-scroll preview container behavior, reset-to-saved behavior, and saved theme sets.
9. Global scrollbar theme-adaptive color refresh on dark/light mode switch (no refresh required).
10. `Solo Vigentes` filter correction to current academic year + active trimester + non-finalized subjects.

## Out of Scope
- Deployment, infrastructure mutation, or production environment writes.
- Non-requested permission model redesigns.
- Unrelated UI redesigns outside requested surfaces.

## Sequencing Rationale
- Governance and autopilot-control updates must be completed before feature execution.
- Selection/undo stack changes are foundational for notification and shortcut correctness.
- Bin and notification changes rely on stabilized interaction state.
- Institution customization and preview parity require isolated validation because they are high-impact.
- Scrollbar and `Solo Vigentes` filter are closed after interaction stack stabilization.
- Final optimization and deep-risk review are mandatory before inReview promotion.

## Validation Gates
- `get_errors` on touched files for every major block.
- Targeted tests first, then full impacted suite.
- `npm run lint`
- `npx tsc --noEmit`
- `npm run test`
- `npm run build` for dashboard/home/layout-impacting work.
- Human merge approval gate via `BRANCH_LOG.md` when `Autopilot Status` is true.

## Rollback Strategy
- Keep scoped, atomic commits by major block.
- If regressions occur, revert at block granularity.
- Preserve lossless reports for deterministic rollback decisions.

## Plan Artifacts
- Strategy: [strategy-roadmap.md](./strategy-roadmap.md)
- Phases: [phases](./phases)
- Review checklist: [reviewing/verification-checklist-2026-04-10.md](./reviewing/verification-checklist-2026-04-10.md)
- Deep risk analysis: [reviewing/deep-risk-analysis-2026-04-10.md](./reviewing/deep-risk-analysis-2026-04-10.md)
- Working log: [working/execution-log.md](./working/execution-log.md)
- Subplans index: [subplans/README.md](./subplans/README.md)
- User updates: [user-updates.md](./user-updates.md)
- Lossless report: [copilot/explanations/temporal/lossless-reports/2026-04-10/autopilot-plan-intake-and-governance-gate-update.md](../../../explanations/temporal/lossless-reports/2026-04-10/autopilot-plan-intake-and-governance-gate-update.md)
- Final continuation phase: [phases/final-phase-continue-autopilot-execution.md](./phases/final-phase-continue-autopilot-execution.md)
