<!-- copilot/explanations/temporal/lossless-reports/2026-04-12/home-selection-mode-multidrag-and-modifier-workflow.md -->
# Lossless Report - Home Selection Mode Multi-Drag and Modifier Workflow

## Requested Scope
- Implement selection-mode behavior updates from the user spec:
  - grouped drag visuals for selected elements,
  - Ctrl/Cmd selection-mode shortcuts,
  - Ctrl/Cmd+Shift range selection,
  - batch confirmation previews with selected names,
  - preserve batch undo behavior.

## Preserved Behaviors
- Existing single-item drag/drop and move flows remain intact when selection mode is inactive.
- Existing share/unshare confirmation logic remains unchanged for single-item moves.
- Existing bulk move undo model (single aggregated undo toast for moved entries) remains intact.

## Files Touched
- [src/hooks/useGhostDrag.ts](src/hooks/useGhostDrag.ts)
- [src/components/modules/FolderCard/FolderCard.tsx](src/components/modules/FolderCard/FolderCard.tsx)
- [src/components/modules/SubjectCard/SubjectCard.tsx](src/components/modules/SubjectCard/SubjectCard.tsx)
- [src/components/modules/SubjectCard/SubjectCardFront.tsx](src/components/modules/SubjectCard/SubjectCardFront.tsx)
- [src/components/modules/ListItems/FolderListItem.tsx](src/components/modules/ListItems/FolderListItem.tsx)
- [src/components/modules/ListItems/SubjectListItem.tsx](src/components/modules/ListItems/SubjectListItem.tsx)
- [src/components/modules/ListViewItem.tsx](src/components/modules/ListViewItem.tsx)
- [src/pages/Home/hooks/useHomeBulkSelection.ts](src/pages/Home/hooks/useHomeBulkSelection.ts)
- [src/pages/Home/hooks/useHomePageHandlers.ts](src/pages/Home/hooks/useHomePageHandlers.ts)
- [src/pages/Home/hooks/useHomePageState.tsx](src/pages/Home/hooks/useHomePageState.tsx)
- [src/pages/Home/hooks/useHomeContentDnd.ts](src/pages/Home/hooks/useHomeContentDnd.ts)
- [src/pages/Home/components/HomeContent.tsx](src/pages/Home/components/HomeContent.tsx)
- [src/pages/Home/components/HomeMainContent.tsx](src/pages/Home/components/HomeMainContent.tsx)
- [src/pages/Home/components/HomeShareConfirmModals.tsx](src/pages/Home/components/HomeShareConfirmModals.tsx)
- [src/pages/Home/Home.tsx](src/pages/Home/Home.tsx)
- [tests/unit/hooks/useHomeBulkSelection.test.js](tests/unit/hooks/useHomeBulkSelection.test.js)
- [tests/unit/hooks/useHomeContentDnd.test.js](tests/unit/hooks/useHomeContentDnd.test.js)

## File-by-File Verification
1. [src/hooks/useGhostDrag.ts](src/hooks/useGhostDrag.ts)
- Added selection-aware companion resolution using `selectionKey` + `selectedItemKeys`.
- Added staged companion transition so selected originals visually converge toward the lead dragged card and hide during drag.
- Multi-ghost now renders preview layers from selected DOM nodes (not only the dragged source).
- Added companion cleanup restoration on drag end.

2. [src/components/modules/FolderCard/FolderCard.tsx](src/components/modules/FolderCard/FolderCard.tsx)
- Forwarded selection context to `useGhostDrag`.
- Forwarded click event to `onOpen(folder, event)` for modifier-aware Home handling.

3. [src/components/modules/SubjectCard/SubjectCard.tsx](src/components/modules/SubjectCard/SubjectCard.tsx)
- Forwarded selection context to `useGhostDrag` for grouped drag previews.

4. [src/components/modules/SubjectCard/SubjectCardFront.tsx](src/components/modules/SubjectCard/SubjectCardFront.tsx)
- `onSelect` now forwards click event for modifier detection upstream.

5. [src/components/modules/ListItems/FolderListItem.tsx](src/components/modules/ListItems/FolderListItem.tsx)
- Forwarded selection context to `useGhostDrag`.
- Ctrl/Cmd click path now routes through navigation callback with event, enabling Home modifier semantics.

6. [src/components/modules/ListItems/SubjectListItem.tsx](src/components/modules/ListItems/SubjectListItem.tsx)
- `onSelect(subject.id, event)` now forwards click event for modifier/range logic.

7. [src/components/modules/ListViewItem.tsx](src/components/modules/ListViewItem.tsx)
- Drag hook now receives type-aware item kind and selection context.
- Subject list-row callback now forwards click event to Home.

8. [src/pages/Home/hooks/useHomeBulkSelection.ts](src/pages/Home/hooks/useHomeBulkSelection.ts)
- Added anchor-aware APIs:
  - `startSelectionWithItem(...)`
  - `selectRangeToItem(...)`
- Added `mergeEntryIntoSelectionMap(...)` for folder ancestor/descendant dedupe parity across toggle/range.
- Added batch confirmation preview builder (`totalCount`, first five names, hidden count) and propagated it into batch move options.
- Added safe parallel fast-path for non-shared, non-shortcut subject-only bulk moves to reduce multi-selection move latency.
- Batch move options now include `skipShortcutUndo: true` to avoid per-item undo-toast override.

9. [src/pages/Home/hooks/useHomePageHandlers.ts](src/pages/Home/hooks/useHomePageHandlers.ts)
- Added `getMoveConfirmationPreview(...)` helper.
- Added `selectionPreview` payload to share/unshare deferred confirmations in batch move paths.
- Close helpers now clear `selectionPreview` field.
- Added `skipShortcutUndo` handling in move paths so bulk operations do not register per-item keyboard undo entries.

10. [src/pages/Home/hooks/useHomePageState.tsx](src/pages/Home/hooks/useHomePageState.tsx)
- Added `selectionPreview` in initial `shareConfirm` and `unshareConfirm` state shape.

11. [src/pages/Home/hooks/useHomeContentDnd.ts](src/pages/Home/hooks/useHomeContentDnd.ts)
- Promote-zone drops now route selected entries through `onDropSelectedItems(currentFolder.parentId)` when dragging a selected item.
- Ensures the "mover a carpeta anterior" target uses the same batch confirmation/share-rule pipeline as other selection-mode drops.

12. [src/pages/Home/components/HomeContent.tsx](src/pages/Home/components/HomeContent.tsx)
- Added centralized modifier-aware interaction routing:
  - Ctrl/Cmd click outside selection mode: start selection with clicked item.
  - Ctrl/Cmd click inside selection mode: open item while keeping selection mode.
  - Ctrl/Cmd+Shift click: select visible range based on rendered order.
- Applied logic to grid cards and list rows for folders/subjects.

13. [src/pages/Home/components/HomeMainContent.tsx](src/pages/Home/components/HomeMainContent.tsx)
- Threaded `startSelectionWithItem` and `selectRangeToItem` into `HomeContent`.

14. [src/pages/Home/components/HomeShareConfirmModals.tsx](src/pages/Home/components/HomeShareConfirmModals.tsx)
- Added shared selection-preview renderer for share/unshare dialogs.
- Preview shows selected count + first five names + overflow indicator.
- Overlay titles/descriptions now switch to selection-level wording when batch preview exists (instead of single dropped item wording).

15. [src/pages/Home/Home.tsx](src/pages/Home/Home.tsx)
- Threaded new bulk-selection APIs from hook to main content component.

16. [tests/unit/hooks/useHomeBulkSelection.test.js](tests/unit/hooks/useHomeBulkSelection.test.js)
- Added coverage for:
  - start-selection + range-selection behavior,
  - batch confirmation preview metadata propagation.

17. [tests/unit/hooks/useHomeContentDnd.test.js](tests/unit/hooks/useHomeContentDnd.test.js)
- Added coverage for selected-item promote-zone drop routing to batch move handler.

## Validation Summary
- Editor diagnostics:
  - `get_errors` clean on all touched source files.
- Focused test run:
  - `npm run test:unit -- tests/unit/hooks/useHomeBulkSelection.test.js tests/unit/hooks/useGhostDrag.test.js tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js tests/unit/hooks/useHomeContentDnd.test.js`
  - Result: 4 test files passed, 65 tests passed.
  - `npm run test:unit -- tests/unit/hooks/useHomeContentDnd.test.js tests/unit/hooks/useHomeBulkSelection.test.js tests/unit/hooks/useGhostDrag.test.js`
  - Result: 3 test files passed, 31 tests passed.
  - `npm run test:unit -- tests/unit/hooks/useHomeBulkSelection.test.js tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js tests/unit/hooks/useHomeContentDnd.test.js tests/unit/hooks/useGhostDrag.test.js`
  - Result: 4 test files passed, 66 tests passed.

## Residual Risk
- Low-to-moderate:
  - Range selection order uses currently rendered Home ordering (collapsed groups excluded), which matches visible UX but may differ from hidden/collapsed items by design.
