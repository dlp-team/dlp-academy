<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-10/reviewing/deep-risk-analysis-2026-04-10.md -->
# Deep Risk Analysis (2026-04-10)

## Security and Permission Boundaries
- No new permission-escalation paths introduced in this execution window.
- Selection/undo and scrollbar changes were limited to UI routing/style/test logic and retained existing ownership/share gating behavior.
- Regression evidence includes existing permission-aware test suites plus updated selection/undo hook coverage.

## Data Integrity and Undo Safety
- Batch undo behavior now has explicit parity evidence for:
	- mixed subject+folder restoration,
	- shared metadata restoration,
	- Ctrl+Z and toast-action callback parity.
- Risks around partial restoration were reduced through deterministic hook-level assertions in [tests/unit/hooks/useHomeBulkSelection.test.js](../../../../../tests/unit/hooks/useHomeBulkSelection.test.js).

## Runtime Failure Modes
- Removed debug `console.log` noise from [src/pages/Home/hooks/useHomeContentDnd.ts](../../../../../src/pages/Home/hooks/useHomeContentDnd.ts) to reduce production console clutter and diagnostics ambiguity.
- Type-check blocker in [src/hooks/useGhostDrag.ts](../../../../../src/hooks/useGhostDrag.ts) was resolved, reducing CI/local validation interruption risk.
- Full validation matrix now passes (`lint`, `tsc`, `test`, `build`).

## UX Regression Risk
- Global scrollbar behavior now uses centralized token-driven styling; content pages no longer maintain divergent local scrollbar rules.
- Empty-state selection-mode behavior is now explicitly asserted as visible-but-inert in [tests/unit/pages/home/HomeMainContent.test.jsx](../../../../../tests/unit/pages/home/HomeMainContent.test.jsx).
- Phase 01 grouped DnD routing and non-selected regression paths are covered in [tests/unit/hooks/useHomeContentDnd.test.js](../../../../../tests/unit/hooks/useHomeContentDnd.test.js).

## Out-of-Scope Risk Log References
- Added 2026-04-11 entry for build chunk-size warning follow-up in [copilot/plans/out-of-scope-risk-log.md](../../../out-of-scope-risk-log.md).
