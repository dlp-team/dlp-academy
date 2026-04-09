<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/phases/phase-02-batch-confirmation-and-undo-pipeline.md -->
# Phase 02 - Batch Confirmation and Undo Pipeline

## Status
- IN_REVIEW

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

## Implementation Update (2026-04-09)
- Added batch-decision propagation in Home move handlers so shared/unshare confirmations can be reused for remaining entries in the same bulk session.
- Added deferred-resolution callbacks from confirmation modals to bulk-selection orchestration so batch execution resumes automatically after confirmation.
- Updated bulk selection move orchestration to keep a single session state (snapshots, moved keys, decision cache, failures) across deferred confirmations.
- Consolidated undo toast payload to represent all moved entries in the batch session instead of partial pre-confirm subsets.

## Validation Evidence (2026-04-09)
- `get_errors` on touched runtime and test files -> PASS.
- `npx vitest run tests/unit/hooks/useHomeBulkSelection.test.js tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js tests/unit/hooks/useHomePageHandlers.dndMatrix.test.js` -> PASS (47 tests).
- `npm run lint` -> PASS.
- `npx tsc --noEmit` -> PASS.
