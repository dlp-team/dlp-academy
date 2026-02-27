# Phase 03 — DnD centralization baseline

## Objective
Reduce duplicated drag payload parsing/building logic between list mode and Tree modal, using shared helper methods for maintainability and parity.

## Scope
- Add shared helpers for drag payload construction and extraction from `DataTransfer`.
- Replace local ad-hoc parse/build logic in list/tree with shared helpers.
- Keep behavior unchanged (shortcut-first movement and shared-folder restrictions remain enforced by Home handlers).

## Initial Tasks
- [ ] Create utility module under `src/utils/` for drag payload helpers.
- [ ] Migrate list-mode item components to helper usage.
- [ ] Migrate Tree modal `TreeItem` and root drop parser to helper usage.
- [ ] Validate diagnostics and manual parity cases.

## Notes
- Preserve existing transfer keys (`treeItem`, `subjectId`, `subjectShortcutId`, `subjectParentId`, `folderId`, `folderShortcutId`) for backward compatibility.
