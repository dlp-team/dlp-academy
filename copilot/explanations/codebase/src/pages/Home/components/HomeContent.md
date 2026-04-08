# HomeContent.jsx

## Changelog
### 2026-04-08: Selection-mode create-subject guard
- Updated `canCreateInCurrentContext` to include `!selectMode`.
- Create-subject entries in Home content views are now suppressed while selection mode is active.

### 2026-04-07: List-mode selection click behavior alignment
- Nested subject rows now toggle selection in selection mode instead of navigating.
- Preserves normal navigation behavior when selection mode is inactive.

### 2026-04-05: Nested list-mode selection parity wiring
- Home list-mode now forwards selection context (`selectMode`, `selectedItemKeys`, `enableSelectionDimming`) to list-row renderers.
- Enables recursive nested list rows to align with Home selection highlighting/dimming behavior.

### 2026-04-05: Selection-mode dimming emphasis for Home grid cards
- Added `getHomeUnselectedDimmingClass(...)` integration for grid wrappers in selection mode.
- Unselected cards now apply brightness/saturation dimming only when at least one selection exists.
- Preserved existing selection semantics and ring highlighting for selected cards.

### 2026-04-02: Nested academic-year wrappers for multi-year courses view
- Added outer academic-year collapsible wrappers in `courses` mode when multiple academic years are present.
- Year wrappers default to collapsed and contain the existing per-course collapsible groups.

### 2026-04-02: Courses groups collapse by default + year-suffix-safe creation prefill
- Courses-mode collapsible groups now default to collapsed state unless explicitly opened by the user.
- Added course-label normalization for create-subject prefills, removing trailing academic-year suffixes like `(2025-2026)` before writing `course` draft data.

### 2026-04-02: Removed Home completion-toggle wiring
- Removed completion-tracking props (`completedSubjectIds`, `setSubjectCompletion`) from `HomeContent` inputs.
- Stopped forwarding completion-action callbacks to subject card/list render paths in this Home content surface.

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
- **Source file:** `src/pages/Home/components/HomeContent.tsx`
- **Last documented:** 2026-04-05
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
