<!-- copilot/plans/active/autopilot-plan-execution-2026-04-08/phases/phase-02-global-undo-and-reusable-notification.md -->
# Phase 02 - Global Undo and Reusable Notification

## Status
- IN_PROGRESS

## Objective
Implement a centralized undo framework for element actions (except creation) with keyboard and toast parity.

## Scope
- Define normalized undo action payload.
- Add reusable bottom notification component for undo prompt.
- Keep Ctrl+Z valid until next action replaces stack head.
- Integrate move/delete/drag-drop and confirmation-based actions.

## Validation
- Deterministic undo stack tests.
- Keyboard-driven and click-driven undo parity checks.
- Ensure creation actions are excluded.

## Implementation Update (2026-04-08)
- Added reusable undo notification component: `src/components/ui/UndoActionToast.tsx`.
- Integrated Home coordinator with shared undo toast rendering and unified callback routing.
- Extended keyboard shortcut coordination to expose undo registration and toast controls.
- Wired page-level move handlers to register undo payloads for subject, folder, and shortcut moves across drag/drop and confirmation callbacks.
- Added focused unit coverage for reusable undo component behavior.
