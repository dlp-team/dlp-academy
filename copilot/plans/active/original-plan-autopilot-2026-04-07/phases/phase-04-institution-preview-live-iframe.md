<!-- copilot/plans/active/original-plan-autopilot-2026-04-07/phases/phase-04-institution-preview-live-iframe.md -->
# Phase 04 - Institution Preview Live Iframe

## Status
- todo

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
