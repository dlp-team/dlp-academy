<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/reviewing/deep-risk-analysis-2026-04-08.md -->
# Deep Risk Analysis

## Security and Permission Boundaries
- Risk: Bin read-only mode could accidentally reuse writable handlers.
- Mitigation: Add explicit read-only guard paths in topic/resource action handlers and block mutation actions.

## Data Integrity and Undo
- Risk: Undo stack could replay wrong payload for batch moves/deletes.
- Mitigation: Normalize undo action payload shape and include immutable snapshots per action.

## UI/Interaction Regressions
- Risk: Selection mode behavior changes can break folder and child selection consistency.
- Mitigation: Add deterministic unit tests for folder-child toggling and multi-select transitions.

## Preview Architecture
- Risk: iframe preview route could drift from real layout when route wiring changes.
- Mitigation: Render real layout tree with mocked state adapter and isolate auth bypass to preview route only.

## Scrollbar Overlay
- Risk: 100vw + overflow handling can introduce horizontal clipping on specific breakpoints.
- Mitigation: Verify on key breakpoints and run visual checks on desktop and mobile widths.

## Topic Recovery
- Risk: restoring create actions from main baseline can overwrite newer permission guards.
- Mitigation: compare logic against current branch and preserve modern permission checks while restoring missing UI triggers.

## Out-of-Scope Risks Log Requirement
- Any risk not addressed within this plan must be documented in [copilot/plans/out-of-scope-risk-log.md](../../../out-of-scope-risk-log.md) before closure.

## 2026-04-08 Delta Review

### Selection-Mode Batch Drag/Drop
- Risk: Routing selected-item drops through batch handlers could unintentionally bypass single-item move protections.
- Mitigation: `useHomeContentDnd` only redirects when the dragged card key exists in active selection set; unselected drags continue through existing single-item paths.
- Evidence: `tests/unit/hooks/useHomeContentDnd.test.js` includes select-mode batch routing and legacy single-item branch coverage.

### Theme Preview Public Route
- Risk: Public `/theme-preview` route could accept untrusted cross-origin preview messages.
- Mitigation: Listener enforces strict same-origin check before applying payload updates.
- Evidence: `tests/unit/pages/theme-preview/ThemePreview.test.jsx` verifies foreign-origin message rejection.

### Scrollbar Overlay Adaptation
- Risk: Removing gutter reservation may produce perceived clipping in specific viewport/browser combinations.
- Mitigation: Active classes use deterministic `overflow-y: scroll`, preserving width stability while avoiding dual-edge gutter compensation artifacts.
- Residual: Manual cross-browser visual pass remains recommended before final lifecycle closure.
