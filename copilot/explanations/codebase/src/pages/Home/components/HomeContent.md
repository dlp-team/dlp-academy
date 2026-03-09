# HomeContent.jsx

## Changelog
### 2026-03-09: Hover-based focus for keyboard shortcuts
- Added `onMouseEnter` focus propagation for folder and subject grid wrappers.
- Preserved existing `onMouseDown` focus behavior for click interactions.
- Enables Ctrl+C/X targeting based on hovered card, not only last clicked card.

## Overview
- **Source file:** `src/pages/Home/components/HomeContent.jsx`
- **Last documented:** 2026-02-24
- **Role:** Reusable UI component consumed by the parent page/module.

## Responsibilities
- Manages local UI state and interaction flow.
- Handles user events and triggers updates/actions.
- Participates in navigation/routing behavior.

## Exports
- `default HomeContent`

## Main Dependencies
- `react`
- `../../../components/ui/SubjectIcon`
- `../../../components/modules/SubjectCard/SubjectCard`
- `../../../components/modules/FolderCard/FolderCard`
- `../../../components/modules/ListItems/SubjectListItem`
- `../../../components/modules/ListViewItem`
- `../../../components/ui/OrphanedShortcutCard`
- `../../../utils/permissionUtils`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
