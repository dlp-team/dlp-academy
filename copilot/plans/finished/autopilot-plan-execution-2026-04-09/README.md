<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-09/README.md -->
# AUTOPILOT Plan Execution (2026-04-09)

## Status
- Lifecycle: finished
- Execution Mode: autopilot (mandatory checklist-driven)
- Branch: feature/autopilot-workflow-updates-2026-04-09
- Owner: hector
- Current Checklist Step: handoff-complete

## Closure Note
- This plan is preserved as finished branch lineage context.
- Ongoing implementation continues in [copilot/plans/active/autopilot-plan-execution-2026-04-10/](../../active/autopilot-plan-execution-2026-04-10/).

## Source Priority
- Primary source of truth: [sources/source-autopilot-user-spec-autopilot-plan-execution-2026-04-09.md](./sources/source-autopilot-user-spec-autopilot-plan-execution-2026-04-09.md)
- The source request is preserved verbatim and is not weakened by this plan package.

## Mandatory Intake Compliance
- This plan was created from user-provided AUTOPILOT_PLAN.md and will be executed via AUTOPILOT_EXECUTION_CHECKLIST workflow.
- Execution must follow [copilot/ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md](../../../ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md).
- Source file must not remain duplicated at root AUTOPILOT_PLAN.md after intake completion.

## Scope
1. Selection mode batch drag/drop parity where selected elements move together and preserve individual drop behavior.
2. Action undo behavior (except creation unless explicitly requested), including Ctrl+Z support and bottom undo card lifecycle.
3. Batch confirmation parity for moving selected items into protected/shared destinations.
4. Selection mode UX constraints: keep create-subject visible but inert, and fix clipped selection border in list mode nested picks.
5. Bin section interaction parity for grid/list press states and scale behavior without visual duplication artifacts.
6. Keyboard shortcuts parity (`Ctrl+C/V`, `Ctrl+X/V`, `Ctrl+Z`) including ownership, sharing boundaries, and undo expectations.
7. Copy semantics for nested content (topics, quizzes, documents, and required metadata such as academic year/course).
8. Institution customization preview and theme management refinements (reset to saved state, saved theme sets, preview parity safeguards).
9. Global scrollbar visual normalization with transparent track and theme-adaptive neutral thumb colors.
10. Global action undo-card restyling for cleaner low-contrast visual hierarchy.
11. Notification UX refresh (bottom-left placement, 10-second lifecycle, no repeat for same event instance, icon mapping) including parity for notification history cards.

## Out of Scope
- Production deployment or infrastructure mutation.
- Destructive branch/history rewrite.
- Unrequested permission-model redesign.
- Unrelated UI redesign outside requested domains.

## Sequencing Rationale
- Batch selection movement and undo are foundational for subsequent shortcut and notification behaviors.
- Bin behavior and selection-mode visual fixes share interaction state and should be validated together.
- Keyboard shortcut ownership and deep-copy semantics depend on stable undo and selection infrastructure.
- Institution customization and global visual refresh are sequenced after core interaction stability to reduce cross-feature regression risk.
- Final optimization and deep risk analysis are mandatory before any inReview promotion.

## Validation Gates
- `get_errors` on touched files per major block.
- Targeted unit/integration tests for touched behavior.
- `npm run lint`
- `npx tsc --noEmit`
- `npm run test`
- `npm run build` for route/theme/layout-impacting changes.

## Rollback Strategy
- Keep each major block in scoped commits.
- If regressions appear, revert at commit-block granularity.
- Preserve lossless reports to support deterministic rollback selection.

## Plan Artifacts
- Strategy: [strategy-roadmap.md](./strategy-roadmap.md)
- Phases: [phases](./phases)
- Subplans index: [subplans/README.md](./subplans/README.md)
- Working log: [working/execution-log.md](./working/execution-log.md)
- Review gate: [reviewing/verification-checklist-2026-04-09.md](./reviewing/verification-checklist-2026-04-09.md)
- Deep risk review: [reviewing/deep-risk-analysis-2026-04-09.md](./reviewing/deep-risk-analysis-2026-04-09.md)
- Manual parity checklist: [reviewing/manual-parity-checklist-2026-04-09.md](./reviewing/manual-parity-checklist-2026-04-09.md)
- User updates: [user-updates.md](./user-updates.md)
