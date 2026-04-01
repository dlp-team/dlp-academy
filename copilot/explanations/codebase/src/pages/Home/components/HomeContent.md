# HomeContent.jsx

## Changelog
### 2026-04-01: Completion toggle wiring for subject cards and list rows
- Added completion state inputs (`completedSubjectIds`) and updater callback (`setSubjectCompletion`).
- Added completion-aware action passthrough to both grid and list subject renderers.
- Completion ID resolution supports source and shortcut subject entries (`targetId` fallback).

### 2026-03-13: Select mode behavior for cards
- Added selection-mode props (`selectMode`, `selectedItemKeys`, `onToggleSelectItem`) to support bulk workflows.
- In selection mode, card interactions toggle selection instead of navigating/opening.
- Added visual ring highlight for selected grid cards.
- Disabled drag-and-drop while selection mode is active to prevent accidental move conflicts.

### 2026-03-09: Copy/Cut visual state integration
- Added `getCardVisualState` prop consumption and wrapper class composition for folder/subject cards.
- Grid cards now animate scale pulse on Ctrl+C/X and show reduced opacity while Ctrl+X clipboard is pending.
- Forwarded visual-state callback to list items for parity across grid and list modes.

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
