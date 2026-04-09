<!-- copilot/plans/active/autopilot-plan-execution-2026-04-09/phases/phase-01-selection-mode-batch-dnd-and-border-fix.md -->
# Phase 01 - Selection Mode Batch DnD and Border Fix

## Status
- IN_PROGRESS

## Objective
Restore full batch drag/drop parity for selected elements and eliminate clipped selection borders in list-mode nested selections.

## Scope
- Ensure selected elements drag as one coordinated batch with drop-target parity.
- Preserve per-item semantics while applying a single batch movement action.
- Keep create-subject affordance visible during selection mode but inert on click.
- Fix right/left clipped selection border rendering in folder/list nested interaction path.

## Risks
- Drag-state coupling could regress single-item drag behavior.
- Selection de-dup adjustments may conflict with nested folder selection state.

## Validation
- Targeted hook/component tests for selection mode and drop handlers.
- Manual parity for grid/list selection visuals.
- `get_errors`, `npm run lint`, and targeted tests.

## Exit Criteria
- Batch drag/drop works for multi-selection without single-item regressions.
- List-mode selection borders render fully and consistently.
- Create-subject click is inert only while selection mode is active.

## Implementation Update (2026-04-09)
- Applied first border-clipping remediation for nested folder list rows by adding horizontal breathing room to expanded children container in `FolderListItem`.
- This prevents shared selection ring highlights from being visually cropped at left/right edges when selecting nested entries in selection mode.

## Pending in Phase 01
- Validate grouped selection drag/drop semantics against all list/grid nesting scenarios.
- Verify create-subject inert behavior and promote phase when all criteria pass.
