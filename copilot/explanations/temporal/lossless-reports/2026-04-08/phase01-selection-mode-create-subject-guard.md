<!-- copilot/explanations/temporal/lossless-reports/2026-04-08/phase01-selection-mode-create-subject-guard.md -->
# Lossless Report - Phase 01 Selection-Mode Create Guard

## Requested Scope
- Continue plan execution after Topic regression recovery.
- Implement Phase 01 UI gate: disable create-subject action while selection mode is active.
- Implement Phase 01 folder-child selection de-dup behavior.

## Preserved Behaviors
- Selection toolbar behavior and existing primary-color exit-border styling are preserved.
- Create-subject actions remain unchanged when selection mode is not active.
- Existing drag/drop and selection wiring remain unchanged.

## Touched Files
- [src/pages/Home/components/HomeContent.tsx](../../../../../src/pages/Home/components/HomeContent.tsx)
- [src/pages/Home/components/HomeMainContent.tsx](../../../../../src/pages/Home/components/HomeMainContent.tsx)
- [src/pages/Home/hooks/useHomeBulkSelection.ts](../../../../../src/pages/Home/hooks/useHomeBulkSelection.ts)
- [tests/unit/pages/home/HomeMainContent.test.jsx](../../../../../tests/unit/pages/home/HomeMainContent.test.jsx)
- [tests/unit/hooks/useHomeBulkSelection.test.js](../../../../../tests/unit/hooks/useHomeBulkSelection.test.js)

## File-by-File Verification
1. `HomeContent.tsx`
- Updated create-entry gating (`canCreateInCurrentContext`) to include `!selectMode`.
- This suppresses create-subject entry points in manual Home content surfaces while selection mode is active.

2. `HomeMainContent.tsx`
- Updated empty-state create passthrough to `canCreateInManualContext && !selectMode`.
- This disables empty-state create action when selection mode is active.

3. `HomeMainContent.test.jsx`
- Added regression assertion that empty-state receives `canCreateSubject = false` when selection mode is active.

4. `useHomeBulkSelection.ts`
- Added parent/descendant selection de-dup orchestration:
	- selecting child entries clears selected ancestor folders,
	- selecting folder entries clears selected descendants.

5. `useHomeBulkSelection.test.js`
- Added focused tests validating both de-dup directions.

## Validation Summary
- `get_errors` on touched files: PASS
- `npm run test -- tests/unit/hooks/useHomeBulkSelection.test.js tests/unit/pages/home/HomeMainContent.test.jsx tests/unit/pages/topic/TopicTabs.createActions.test.jsx tests/unit/hooks/useTopicLogic.test.js`: PASS
- `npm run lint`: PASS
- `npx tsc --noEmit`: PASS

## Residual Risks
- Remaining Phase 01 drag/drop batch-parity and batch-move confirmation parity gates are still open and require dedicated implementation blocks.
