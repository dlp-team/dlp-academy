<!-- copilot/plans/finished/copilot-agentic-trust-and-git-lifecycle-2026-04-06/phases/phase-02-context-architecture-and-instruction-compaction.md -->
# Phase 02 - Context Architecture and Instruction Compaction

## Status
COMPLETED

## Objective
Reduce context noise and increase Copilot response precision by improving instruction layering and scoped guidance.

## Planned Changes
- Audit always-on instruction content for duplication and excessive verbosity.
- Move heavy details into scoped instruction files or skills where possible.
- Document concise context hygiene rules for session resets and targeted file loading.
- Keep repository safety constraints intact while reducing token load.

## Targets
- `.github/copilot-instructions.md`
- `AGENTS.md`
- `.github/instructions/*.instructions.md`
- Optional supporting docs under `copilot/`

## Risks
- Compaction may accidentally remove critical constraints.

## Exit Criteria
- Updated instruction hierarchy is compact, explicit, and non-conflicting.
- No mandatory safety rule is dropped.
- Documentation reflects the new context routing policy.

## Validation
- `npm run lint` for touched JS/TS docs scripts if applicable.
- `get_errors` on all touched instruction and plan files.
- Manual diff review to confirm no required guardrail was removed.

## Completion Notes
- Completed on 2026-04-06.
- Added scoped efficiency instruction: `.github/instructions/copilot-context-efficiency.instructions.md`.
- Compacted duplicate leverage-enforcement policy in `.github/copilot-instructions.md`.
- Added deterministic references for routing and command boundaries in always-on guidance.



