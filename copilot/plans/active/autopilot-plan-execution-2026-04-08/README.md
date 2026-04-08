<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/README.md -->
# AUTOPILOT Plan Execution (2026-04-08)

## Status
- Lifecycle: active
- Execution Mode: autopilot (mandatory checklist-driven)
- Branch: development (pending feature-branch switch for implementation blocks)
- Owner: hector

## Source Priority
- Primary source of truth: [sources/source-autopilot-user-spec-autopilot-plan-execution-2026-04-08.md](./sources/source-autopilot-user-spec-autopilot-plan-execution-2026-04-08.md)
- The source request is preserved verbatim and is not weakened by this plan package.

## Mandatory Intake Compliance
- This plan was created under the AUTOPILOT intake rule.
- Execution must follow [copilot/ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md](../../../ACTIVE-GOVERNANCE/AUTOPILOT_EXECUTION_CHECKLIST.md).
- Source file must not remain duplicated at [copilot/plans/AUTOPILOT_PLAN.md](../../../AUTOPILOT_PLAN.md) after intake completion.

## Scope
1. Selection mode behavior parity with individual drag-and-drop.
2. Undo system for actions (except creation), including Ctrl+Z and reusable 5-second undo notifications.
3. Batch-move confirmation parity when moving selected elements into folders.
4. Selection-mode UX adjustments (exit button border, disable create-subject while active, list/folder de-duplication logic).
5. Bin tab visual and interaction parity (grid/list press behavior, opacity, no delayed options).
6. Bin "Ver contenido" read-only navigation parity with other tabs.
7. Institution customization tab fixes (color-card interactions, hex editing, save/reset confirmation).
8. Institution preview architecture migration to `theme-preview` mock route + iframe `postMessage` updates.
9. Global scrollbar overlay behavior without layout cut-offs + theme-adaptive styling.
10. Global action undo extension and central reusable notification component.
11. User notifications when subject sharing/assignment/enrollment events occur.
12. Topic page regression recovery for create actions (quizzes, exams, study guides) based on prior main behavior.

## Out of Scope
- Production deployment.
- Destructive branch/history rewriting.
- Unrelated UX redesigns not requested in source.
- Replacing existing permission model outside requested behavior changes.

## Sequencing Rationale
- Undo/selection logic and reusable notification primitives are foundational and shared by multiple requests.
- Bin and selection improvements are coupled through shared interaction handlers and selection state.
- Institution customization is split into UI fixes first, then architecture (iframe + preview route).
- Topic regression recovery is isolated late-phase to reduce cross-feature interference and enable direct baseline comparison.

## Validation Gates
- `get_errors` on all touched files after each major block.
- Targeted tests for touched behavior, then full impacted suites.
- `npm run lint`
- `npm run test`
- `npx tsc --noEmit`
- `npm run build` for layout/theme/route structural changes.

## Rollback Strategy
- Keep each major block in isolated scoped commits.
- If regressions appear, apply focused revert commits per block.
- Preserve lossless reports for each phase to support precise rollback.

## Plan Artifacts
- Strategy: [strategy-roadmap.md](./strategy-roadmap.md)
- Phases: [phases](./phases)
- Subplans index: [subplans/README.md](./subplans/README.md)
- Working log: [working/execution-log.md](./working/execution-log.md)
- Review gate: [reviewing/verification-checklist-2026-04-08.md](./reviewing/verification-checklist-2026-04-08.md)
- Deep risk review: [reviewing/deep-risk-analysis-2026-04-08.md](./reviewing/deep-risk-analysis-2026-04-08.md)
- User updates: [user-updates.md](./user-updates.md)
