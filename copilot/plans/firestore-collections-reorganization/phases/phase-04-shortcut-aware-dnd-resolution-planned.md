# Phase 04: Shortcut-aware DnD & Content Resolution (Planned)

## Goal

Implement drag/drop and selector behavior so shared items are organized via shortcuts without mutating source parent ownership.

## Planned Work

- Intercept drag/drop when user moves shared item into personal folder.
- Create shortcut doc instead of updating source `parentId`.
- Keep owned-item move path intact for editable content.
- Query direct children + shortcuts for the active folder.
- Resolve shortcut targets and return normalized merged items.
- Preserve metadata (`isShortcut`, `shortcutId`, `targetType`) for UI affordances.

## Edge Cases

- Resolve failures must produce orphan/ghost cards.
- Duplicate rendering must be prevented via deterministic dedupe.
- Permission-denied targets must degrade gracefully in UI.

## Done Criteria

- No source parent mutation for shared-item personal placement.
- Merged list rendering works in both grid/list flows.
- Regression checks pass for owner and non-owner move scenarios.
