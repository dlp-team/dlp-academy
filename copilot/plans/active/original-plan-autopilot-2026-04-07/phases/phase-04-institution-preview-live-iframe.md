<!-- copilot/plans/active/original-plan-autopilot-2026-04-07/phases/phase-04-institution-preview-live-iframe.md -->
# Phase 04 - Institution Preview Live Iframe

## Status
- finished

## Objectives
- Replace static preview behavior with live iframe rendering of app context.
- Implement postMessage dispatcher from dashboard to iframe for temporary color injection.
- Separate color-card body selection from swatch click picker open.
- Add highlight messaging to iframe for affected UI regions.
- Add save-confirmation gate using registry-approved modal component.
- Introduce preview-role toggle (teacher/student) and mock preview account flow.

## Validation
- get_errors on institution dashboard, iframe integration, and theme listener surfaces.
- Targeted tests for message payload creation and reducer/state transitions.
- Manual verification for no-save preview, confirmation flow, and role toggles.

## Outcome (In Review)
- Default preview path switched to live iframe rendering with parent->iframe postMessage synchronization.
- Added protocol-based payload dispatch for temporary theme and highlight CSS injection.
- Added separation between color-card selection and swatch picker opening in token rows.
- Added iframe-side highlight messaging and runtime role toggle handoff (`teacher`/`student`) for mock preview account context.
- Added save-confirmation gate using `DashboardOverlayShell` before persistence.
- Targeted diagnostics and tests passed for live preview, payload builder, and interaction split paths.
- Commit/push gate completed on branch `feature/hector/original-plan-execution-2026-0407`.
