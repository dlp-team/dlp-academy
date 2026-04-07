<!-- copilot/explanations/temporal/lossless-reports/2026-04-07/selection-mode-overhaul-phase1-bulk-shared-rules-and-undo.md -->
# Lossless Report - Selection Mode Phase 01

## Requested Scope
1. Exclude selected folders from move destination options in selection mode.
2. Reuse single-item shared/unshared move rules for batch moves.
3. Add primary-color border styling on "Salir de la selección" button.
4. Fix list mode selection-mode click behavior so folder/subject clicks select instead of navigating.
5. Add Ctrl+Z undo path with a 5-second bottom undo notification.

## Out-of-Scope Behaviors Preserved
- Existing Home tabs and non-selection manual interactions remain unchanged.
- Existing share/unshare modal copy and actions remain intact.
- Existing delete workflow and feedback tones remain intact.
- Existing drag-drop routes outside selection mode remain intact.

## Touched Files
- src/pages/Home/hooks/useHomeBulkSelection.ts
- src/pages/Home/hooks/useHomePageHandlers.ts
- src/pages/Home/Home.tsx
- src/pages/Home/components/HomeSelectionToolbar.tsx
- src/pages/Home/components/HomeBulkActionFeedback.tsx
- src/pages/Home/components/HomeContent.tsx
- src/components/modules/ListItems/FolderListItem.tsx

## Per-File Verification
- src/pages/Home/hooks/useHomeBulkSelection.ts
  - Added destination filtering that removes selected folders and descendants from move target list.
  - Added centralized move-rule callback integration for batch move execution.
  - Added undo toast state, Ctrl+Z listener, and move undo restoration path.
- src/pages/Home/hooks/useHomePageHandlers.ts
  - Added `moveSelectionEntryWithShareRules` for reusable per-entry move orchestration.
  - Added explicit move status signals (`moved`, `deferred`, `blocked`, `noop`) in selection-relevant branches.
- src/pages/Home/Home.tsx
  - Wired bulk-selection hook to centralized move-rule function.
  - Switched selection toolbar destination list to filtered folders.
  - Added floating undo feedback component wiring.
- src/pages/Home/components/HomeSelectionToolbar.tsx
  - Added primary-token border treatment for active "Salir de la selección" state.
- src/pages/Home/components/HomeBulkActionFeedback.tsx
  - Added optional floating bottom notification mode with action and close controls.
- src/pages/Home/components/HomeContent.tsx
  - Nested list subject navigation callback now toggles selection in select mode.
- src/components/modules/ListItems/FolderListItem.tsx
  - Folder row click in select mode now toggles folder selection while preserving expand/collapse.

## File Organization Reasoning
- Kept existing architecture and extracted no new files to avoid broad refactor drift in this phase.
- Reused existing hooks/components to preserve current contracts and minimize integration risk.

## Risks Found and Checks
- Risk: Bulk move to shared folders could still bypass rule parity.
  - Check: Batch flow now routes through `moveSelectionEntryWithShareRules` instead of direct CRUD update path.
- Risk: Selection-mode click behavior in recursive list rows could still navigate.
  - Check: Added explicit selection-mode guards in nested subject callback and folder click handler.
- Risk: Undo notification could conflict with existing feedback banner.
  - Check: Added separate floating feedback rendering channel with independent close/timeout lifecycle.

## Validation Summary
- get_errors: clean for all touched files.
- Targeted tests passed:
  - tests/unit/hooks/useHomeBulkSelection.test.js
  - tests/unit/hooks/useHomePageHandlers.dndMatrix.test.js
  - tests/unit/pages/home/HomeBulkActionFeedback.test.jsx
