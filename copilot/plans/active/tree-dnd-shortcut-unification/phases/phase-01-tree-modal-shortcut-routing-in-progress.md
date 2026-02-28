# Phase 01 — Tree modal shortcut-safe drop routing

## Objective
Guarantee that Tree modal drag/drop applies the same shortcut movement policy used in list mode and never moves source items when dragging shortcuts.

## Planned Changes
- Add shortcut IDs to Tree modal drag payloads and external transfer fields.
- Route Tree modal subject/folder drop actions to Home handler wrapper (`onDropWithOverlay`) for shared policy execution.
- Update root-zone drops with shortcut-aware payload parsing.

## Risks
- Root-zone behavior changes if parent/source IDs are incorrect.
- Tree reorder behavior may diverge if target metadata is incomplete.

## Completion Notes
- Tree modal now includes shortcut IDs in drag payloads (`treeItem`, `subjectShortcutId`, `folderShortcutId`).
- Tree modal drop routing now delegates folder/subject folder-target drops to `onDropWithOverlay` (shared Home handler path).
- Root drop now forwards shortcut context so shortcut-only movement rules are respected.
- Tree rows now use `useGhostDrag` for custom drag ghost parity with list mode.
- Remaining: extract shared helper(s) to reduce duplicated payload parsing between list and tree paths.
