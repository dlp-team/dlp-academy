<!-- copilot/plans/active/autopilot-plan-scrollbar-execution-2026-04-12/reviewing/deep-risk-analysis-2026-04-12.md -->
# Deep Risk Analysis (2026-04-12)

## Security and Permissions
- Risk: Bulk move/delete operations bypass existing permission checks when executed as grouped actions.
- Mitigation: Route grouped actions through existing single-item permission utilities and enforce deny-path tests.

## Data Integrity
- Risk: Batch undo snapshots may miss sharing metadata or parent-folder ancestry during grouped operations.
- Mitigation: Snapshot pre-action state for each item (location + sharing metadata + item type), and validate full replay.

## UX/Behavioral Regressions
- Risk: Ctrl+click behavior could conflict with existing selection toggle and navigation handlers.
- Mitigation: Define deterministic priority order for click modifiers and add targeted tests for each modifier combo.

## Performance
- Risk: Grouped drag transitions and large selection ghost rendering may cause frame drops on big selections.
- Mitigation: Cap expensive animation payload, use transform-only transitions, and profile in grid/list modes.

## Global Style Regressions
- Risk: Scrollbar changes can leak into overlays/modals and break layout assumptions.
- Mitigation: Verify scoped selectors and audit key modal/content containers that rely on `custom-scrollbar`.

## Out-of-Scope Risk Logging
- Any risk discovered outside this plan scope must be logged to `copilot/plans/out-of-scope-risk-log.md`.