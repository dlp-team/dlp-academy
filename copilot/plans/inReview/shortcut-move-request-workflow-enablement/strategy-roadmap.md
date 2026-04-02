<!-- copilot/plans/inReview/shortcut-move-request-workflow-enablement/strategy-roadmap.md -->
# Strategy Roadmap - Shortcut Move Request Workflow Enablement

## Phase Status Legend
- PLANNED
- IN_PROGRESS
- COMPLETED
- BLOCKED

## Ordered Phases

### Phase 01 - Request Creation Foundation
- Status: COMPLETED
- Goal: replace modal placeholder flow with real callable-backed request creation + requester feedback.
- Outputs:
  - callable function `createShortcutMoveRequest`,
  - Home hook integration,
  - request persistence and owner notification creation.

### Phase 02 - Owner Review and Resolution
- Status: COMPLETED
- Goal: let target-folder owners approve/reject pending requests from UI.
- Outputs:
  - review UI surface,
  - callable function `resolveShortcutMoveRequest`,
  - approve/reject behavior + requester notifications.

### Phase 03 - Rules and Test Hardening
- Status: COMPLETED
- Goal: enforce least-privilege rules and add deterministic tests.
- Outputs:
  - `shortcutMoveRequests` rules,
  - rules tests for requester/owner/admin boundaries,
  - unit tests for Home request creation and owner resolution UI flows.

### Phase 04 - Final Validation and Closure
- Status: COMPLETED
- Goal: run validation gates, sync docs, and transition lifecycle.
- Outputs:
  - lint/typecheck/tests pass evidence,
  - lossless report,
  - explanation sync and closure checklist.

## Rollback Strategy
- Keep function additions isolated and non-destructive.
- Keep UI changes behind existing modal path and review panel only.
- Revert phase-by-phase if regressions surface.

