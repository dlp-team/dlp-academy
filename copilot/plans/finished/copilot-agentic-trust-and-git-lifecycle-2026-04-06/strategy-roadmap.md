<!-- copilot/plans/finished/copilot-agentic-trust-and-git-lifecycle-2026-04-06/strategy-roadmap.md -->
# Strategy Roadmap

## Source of Truth
This roadmap is the authoritative sequencing and status reference for this plan.

## Phase Matrix
| Phase | Title | Status | Exit Gate |
|---|---|---|---|
| 01 | Research synthesis and baseline alignment | COMPLETED | Research insights mapped to repo-specific actions and constraints |
| 02 | Context architecture and instruction compaction | COMPLETED | Always-on guidance trimmed and scoped guidance routed to targeted files/skills |
| 03 | Agent skill routing and orchestration hardening | COMPLETED | Skills and operational docs aligned with safe autonomous flow |
| 04 | Git lifecycle automation and command boundary enforcement | COMPLETED | Branch, commit, push, and command authorization gates codified and testable |
| 05 | Observability, KPI scorecard, and pilot rollout | COMPLETED | Diagnostics loop and efficiency metrics operational |
| 06 | Final optimization and deep risk review | COMPLETED | Consolidation + inReview deep risk analysis completed |

## Execution Sequence
1. Build a direct mapping from GEMINI research themes to this repository surfaces.
2. Implement context and instruction architecture updates that reduce token waste.
3. Tighten reusable skills and operational workflows for predictable autonomy.
4. Enforce git lifecycle controls with explicit allow/forbid/escalation boundaries.
5. Add observability and KPI tracking to measure quality, speed, and rework.
6. Execute mandatory optimization and deep risk analysis before lifecycle transition.

## Deliverable Map by Phase
- Phase 01: Research synthesis note, baseline gap inventory, prioritized backlog.
- Phase 02: Updated instruction layering and context hygiene runbook.
- Phase 03: Skill-level routing refinements and reusable execution templates.
- Phase 04: Git workflow controls and command boundary documentation updates.
- Phase 05: Efficiency scorecard cadence and diagnostics playbook updates.
- Phase 06: Optimization evidence, deep risk analysis, and closure checklist.

## Completed Deliverables (Current Session)
- Phase 01: `working/baseline-gap-inventory.md` added and aligned to synthesis matrix.
- Phase 02: `.github/copilot-instructions.md` compacted and `.github/instructions/copilot-context-efficiency.instructions.md` added.
- Phase 03: `copilot/COPILOT_AGENTIC_EXECUTION_ROUTING_2026-04-06.md` added for deterministic routing.
- Phase 04: Command governance hardened in `copilot/autopilot/` docs and matrix added.
- Phase 05: KPI and diagnostics artifacts updated for measurable pilot operations.

## Validation Gates
- Planning stage: `get_errors` on touched plan files.
- Implementation gate per major block:
  - `npm run lint`
  - `npm run test`
  - `npx tsc --noEmit`
- Security gate before git commit/push blocks:
  - `npm run security:scan:staged`
  - `npm run security:scan:branch`

## Escalation and Stop Conditions
- Stop and escalate if a required command is not in approved boundaries.
- Stop and escalate if tests fail after 3 deterministic remediation attempts.
- Stop and escalate before any destructive or deployment command.

## Rollback Gates
- Roll back by validated block; do not bundle rollback across unrelated changes.
- Re-validate lint/tests/type-check after each rollback action.
- Keep lifecycle state synchronized with actual execution state.

## Residual Risks to Track
- Cross-file instruction conflicts after compaction.
- Metric drift if scorecard collection is not consistently updated.
- Over-constrained command boundaries that slow routine work.

## Lifecycle Transition Rules
- todo -> active: Implementation starts and phase execution begins.
- active -> inReview: All planned phases implemented and validated.
- inReview -> finished: Verification checklist complete and deep risk review documented.

## Transition Readiness
- Implementation phases are complete and validated.
- Lifecycle transitions completed: `active` -> `inReview` -> `finished`.

## Lifecycle Outcome
- Final state: `finished`
- Review decision: PASS (see `reviewing/verification-checklist-2026-04-06.md`)



