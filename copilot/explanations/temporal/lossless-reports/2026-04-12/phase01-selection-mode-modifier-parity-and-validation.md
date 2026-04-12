<!-- copilot/explanations/temporal/lossless-reports/2026-04-12/phase01-selection-mode-modifier-parity-and-validation.md -->
# Lossless Report - Phase 01 Selection Mode Modifier Parity and Validation

## Requested Scope
- Start executing the active plan from todo promotion.
- Implement Phase 01 selection-mode grouped behavior and shortcut parity foundations.

## Implemented
1. Added modifier-aware selection interaction routing in Home content surfaces:
   - Ctrl/Cmd+click enters selection mode when off and selects the clicked item.
   - Ctrl/Cmd+click on an already-selected item in selection mode navigates while preserving selection state.
   - Ctrl/Cmd+Shift+click applies contiguous range selection from anchor to target using rendered DOM order.
2. Propagated pointer event context through card/list modules so Home can apply modifier behavior without changing non-Home consumers.
3. Added focused HomeContent unit coverage for modifier behavior parity.

## Preserved Behaviors
- Standard click behavior remains unchanged:
  - In selection mode, plain click continues toggling selection.
  - Outside selection mode, plain click continues normal navigation/open behavior.
- Existing grouped drag/drop handling and ghost stack behavior were preserved and revalidated via focused tests.
- No permission rules, share flows, or deletion/edit actions were changed.

## Touched Files
- `src/pages/Home/components/HomeContent.tsx`
- `src/pages/Home/components/HomeMainContent.tsx`
- `src/pages/Home/Home.tsx`
- `src/components/modules/FolderCard/FolderCard.tsx`
- `src/components/modules/SubjectCard/SubjectCardFront.tsx`
- `src/components/modules/ListItems/FolderListItem.tsx`
- `src/components/modules/ListItems/SubjectListItem.tsx`
- `src/components/modules/ListViewItem.tsx`
- `tests/unit/pages/home/HomeMainContent.test.jsx`
- `tests/unit/pages/home/HomeContent.selectionModifiers.test.jsx`

## File-by-File Verification
- `src/pages/Home/components/HomeContent.tsx`
  - Added centralized `handleItemInteraction(...)` for modifier-aware selection/navigation.
  - Added DOM-order range selection helper anchored by last valid selection key.
  - Updated grid/list callbacks to route through shared interaction logic.
- `src/pages/Home/components/HomeMainContent.tsx`
  - Added `setSelectMode` prop plumbing into `HomeContent`.
- `src/pages/Home/Home.tsx`
  - Passed `setSelectMode` down to `HomeMainContent`.
- `src/components/modules/FolderCard/FolderCard.tsx`
  - Forwarded click event in `onOpen(folder, event)` callback.
- `src/components/modules/SubjectCard/SubjectCardFront.tsx`
  - Forwarded click event in `onSelect(subjectId, event)` callback.
- `src/components/modules/ListItems/FolderListItem.tsx`
  - Forwarded click event through folder navigation callbacks.
- `src/components/modules/ListItems/SubjectListItem.tsx`
  - Forwarded click event through subject selection callback.
- `src/components/modules/ListViewItem.tsx`
  - Forwarded click event from `SubjectListItem` to `onNavigateSubject`.
- `tests/unit/pages/home/HomeMainContent.test.jsx`
  - Added `setSelectMode` to test fixture props.
- `tests/unit/pages/home/HomeContent.selectionModifiers.test.jsx`
  - Added tests for Ctrl/Cmd entry, Ctrl selected-item navigation parity, and Ctrl+Shift range selection.

## Validation Summary
- `get_errors` on all touched source/test files: clean.
- Targeted tests executed and passing:
  - `tests/unit/pages/home/HomeContent.selectionModifiers.test.jsx`
  - `tests/unit/pages/home/HomeMainContent.test.jsx`
  - `tests/unit/hooks/useHomeContentDnd.test.js`
  - `tests/unit/hooks/useHomeBulkSelection.test.js`
  - `tests/unit/hooks/useGhostDrag.test.js`

## Next Phase
- Phase 02: Batch confirmation copy and full-batch undo reliability.
