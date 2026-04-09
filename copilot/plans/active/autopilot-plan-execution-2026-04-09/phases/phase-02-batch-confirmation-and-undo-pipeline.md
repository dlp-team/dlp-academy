<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/phases/phase-02-batch-confirmation-and-undo-pipeline.md -->
# Phase 02 - Batch Confirmation and Undo Pipeline

## Status
- PLANNED

## Objective
Guarantee single-confirmation batch move behavior and consistent Ctrl+Z undo flow for affected actions.

## Scope
- Convert multi-item protected/shared move confirmation into single batch confirmation.
- Ensure confirmed batch action applies to all selected elements, not only first element.
- Ensure undo payload represents whole batch action for Ctrl+Z and undo-card interactions.
- Keep replacement semantics: new action supersedes prior undo state.

## Risks
- Batch payload integrity failures could partially revert state.
- Shared-folder constraints may diverge between single and batch paths.

## Validation
- Targeted tests for batch confirm handler and undo registration payloads.
- Manual verification for move/delete/relocate action classes.
- `get_errors`, `npm run lint`, and `npx tsc --noEmit`.

## Exit Criteria
- One confirmation controls full batch action path.
- Undo fully restores entire affected batch where supported.
- Ctrl+Z behavior matches replacement-policy expectations.
