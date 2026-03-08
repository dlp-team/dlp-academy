<!-- copilot/explanations/temporal/phase-01-closure-and-phase-02-test-progress-2026-03-07.md -->
# Phase 01 Closure and Phase 02 Test Progress (2026-03-07)

## What was implemented
- Completed Phase 01 remaining gap by adding `App` auth-listener fallback unit coverage.
- Added Phase 02 ownership transfer unit coverage for:
  - `useSubjects.transferSubjectOwnership` positive path and invalid-recipient path.
  - `useFolders.transferFolderOwnership` positive path and same-user rejection.
- Added Phase 02 deletion/shortcut unit coverage for:
  - `useFolders.deleteFolderOnly` re-parenting behavior.
  - `useShortcuts.moveShortcut`, `useShortcuts.deleteShortcut`, `useShortcuts.deleteOrphanedShortcuts`.

## Key test design notes
- `App` fallback test uses route `/home` and mocks Firestore `onSnapshot` error callback to validate auth-only fallback session state.
- Ownership transfer tests assert both state mutation (`updateDoc`) and previous-owner shortcut write (`setDoc` with merge).
- Shortcut orphan cleanup test drives resolved orphan state via snapshot shape (`exists() === false`) and asserts only orphan IDs are deleted.

## Validation
- Passed targeted suites:
  - `tests/unit/App.authListener.test.jsx`
  - `tests/unit/hooks/useSubjects.test.js`
  - `tests/unit/hooks/useFolders.test.js`
  - `tests/unit/hooks/useShortcuts.test.js`
- No static errors reported by `get_errors` on touched test files.

## Plan sync updates
- `phase-01-core-routing-session-theme-utilities.md`: all items checked.
- `phase-02-ownership-deletion-shortcuts-ghost.md`: checked completed ownership/shortcut/folder-delete items covered by this implementation.
- `README.md` and `strategy-roadmap.md` in the active plan updated to reflect current phase and next actions.

## Additional progress (2026-03-08)
- Added missing ownership transfer error-path tests in subject and folder hooks:
  - self recipient rejection
  - missing/not-found source rejection (subject)
  - non-owner permission rejection
  - non-shared recipient rejection (folder)
- Added shortcut deduplication coverage for `createShortcut` existing-shortcut path:
  - updates primary shortcut location
  - deletes duplicate shortcuts
  - avoids new shortcut creation

### Validation
- Passed focused suites after additions:
  - `tests/unit/hooks/useSubjects.test.js`
  - `tests/unit/hooks/useFolders.test.js`
  - `tests/unit/hooks/useShortcuts.test.js`
  - Aggregate: 23 tests passing.

## Additional progress (2026-03-08 - Cascade Deletion)
- Added `useFolders.deleteFolder` recursive cascade coverage:
  - deletes nested child folders
  - deletes subjects from root and nested folders
  - commits a single batch with all deletions
- Added `useSubjects.permanentlyDeleteSubject` cascade coverage:
  - deletes topic documents
  - deletes topics
  - deletes owner shortcuts targeting the subject
  - deletes subject document after dependency cleanup
  - verifies non-owner rejection path remains protected

### Validation
- Focused and consolidated runs passing after this increment:
  - `tests/unit/hooks/useSubjects.test.js`
  - `tests/unit/hooks/useFolders.test.js`
  - `tests/unit/hooks/useShortcuts.test.js`
  - Aggregate: 26 tests passing.

## Additional progress (2026-03-08 - Shortcut Permission and Partial Failure)
- Added non-owner shortcut-context denial coverage in `useHomePageHandlers`:
  - viewer inside shared folder cannot promote subject shortcut upward
  - shortcut-based drag move does not mutate source subject
- Added partial-failure handling coverage for `useSubjects.permanentlyDeleteSubject`:
  - continues after topic documents query failure
  - continues after document and shortcut delete failures
  - still deletes the subject at the end

### Validation
- Passed focused run after this increment:
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - `tests/unit/hooks/useSubjects.test.js`
  - Aggregate: 25 tests passing.

## Additional progress (2026-03-08 - Folder Partial Failure Resilience)
- Added folder deletion resilience coverage in `useFolders`:
  - `deleteFolder` still commits and deletes target folder when child queries fail
  - `deleteFolderOnly` still commits and deletes target folder when move queries fail

### Validation
- Passed focused run:
  - `tests/unit/hooks/useFolders.test.js`
  - Aggregate: 10 tests passing.

## Additional progress (2026-03-08 - Subject Quiz/Resource Cascade)
- Extended `useSubjects.permanentlyDeleteSubject` to include per-topic cleanup for:
  - `resumen` resources
  - `quizzes`
- Extended unit coverage to verify successful cascade and partial-failure resilience for both collections.
- Updated Phase 02 checklist and roadmap to reflect completed cascade scope.

### Validation
- Passed focused run:
  - `tests/unit/hooks/useSubjects.test.js`
  - Aggregate: 14 tests passing.

## Additional progress (2026-03-08 - Shortcut Idempotency and Permission Denial)
- Added `useShortcuts` coverage for:
  - idempotent rerun behavior in `deleteOrphanedShortcuts`
  - permission-denied propagation in `deleteShortcut`
- Added `useHomePageHandlers` coverage for:
  - non-editor owner-mismatch guard when moving subjects from shared source folders
  - repeated same-folder drop no-op behavior
- Updated Phase 02 checklist and roadmap for completed idempotency and shortcut permission-denied scope.

### Validation
- Passed focused run:
  - `tests/unit/hooks/useShortcuts.test.js`
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - Aggregate: 20 tests passing.

## Additional progress (2026-03-08 - Folder Delete Rerun No-Op)
- Added `useFolders` idempotent rerun coverage:
  - `deleteFolder` no-op when folder is already missing
  - `deleteFolderOnly` no-op when folder is already missing

### Validation
- Passed focused run:
  - `tests/unit/hooks/useFolders.test.js`
  - Aggregate: 12 tests passing.
- Passed consolidated run:
  - `tests/unit/hooks/useFolders.test.js`
  - `tests/unit/hooks/useShortcuts.test.js`
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - Aggregate: 32 tests passing.

## Additional progress (2026-03-08 - Topic Delete Cascade and Resilience)
- Extended `useTopicLogic.handleDeleteTopic` to cascade cleanup of topic-linked:
  - `documents`
  - `resumen`
  - `quizzes`
  before deleting the topic itself.
- Added topic deletion tests for:
  - cascade cleanup success path
  - partial-failure resilience (query/delete failures do not block final topic deletion)
- Updated Phase 02 checklist and roadmap to reflect completed topic deletion scope.

### Validation
- Passed focused run:
  - `tests/unit/hooks/useTopicLogic.test.js`
  - Aggregate: 8 tests passing.
- Passed consolidated run:
  - `tests/unit/hooks/useTopicLogic.test.js`
  - `tests/unit/hooks/useFolders.test.js`
  - `tests/unit/hooks/useShortcuts.test.js`
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - Aggregate: 40 tests passing.

## Additional progress (2026-03-08 - Missing InstitutionId Deletion Variants)
- Added deletion edge-case tests for missing metadata:
  - `useSubjects.permanentlyDeleteSubject` with missing `institutionId`
  - `useFolders.deleteFolder` and `useFolders.deleteFolderOnly` with missing `institutionId`
  - `useShortcuts.deleteOrphanedShortcuts` with missing `institutionId`
- Synced checklist to mark completed missing-institutionId deletion coverage and subject-delete-triggered topic cascade item.

### Validation
- Passed focused combined run:
  - `tests/unit/hooks/useSubjects.test.js`
  - `tests/unit/hooks/useFolders.test.js`
  - `tests/unit/hooks/useShortcuts.test.js`
  - Aggregate: 37 tests passing.

## Additional progress (2026-03-08 - Folder Deletion Failure Resilience)
- Hardened `useFolders` deletion flows:
  - `deleteFolder` now performs best-effort shortcut cleanup and falls back to direct root folder delete when batch commit fails.
  - `deleteFolderOnly` now performs best-effort shortcut cleanup and still deletes the folder when pre-delete move batch commit fails.
- Added targeted tests for commit-failure and shortcut-delete failure paths.
- Synced checklist item for "Folder deletion with failed subject/shortcut deletion (error handling)" to complete.

### Validation
- Passed focused run:
  - `tests/unit/hooks/useFolders.test.js`
  - Aggregate: 18 tests passing.
- Passed consolidated run:
  - `tests/unit/hooks/useFolders.test.js`
  - `tests/unit/hooks/useSubjects.test.js`
  - `tests/unit/hooks/useShortcuts.test.js`
  - `tests/unit/hooks/useTopicLogic.test.js`
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - Aggregate: 62 tests passing.

## Additional progress (2026-03-08 - Topic Orphan + Missing Institution Variants)
- Added `useTopicLogic` edge-case tests for:
  - orphaned topic child entries (`documents`, `resumen`, `quizzes`) where delete calls return `not-found`
  - subject metadata without `institutionId` during topic deletion flow
- Synced Phase 2 checklist for completed topic orphan/missing-institution coverage.

### Validation
- Passed focused run:
  - `tests/unit/hooks/useTopicLogic.test.js`
  - Aggregate: 10 tests passing.

## Additional progress (2026-03-08 - Ghost Drag Hook Integrity)
- Added a dedicated unit suite for `useGhostDrag` with coverage for:
  - drag-ghost creation metadata (`data-original-scale` and `data-scale`) and teardown on drag end
  - pointer-driven ghost position updates with zero-pointer event guard behavior
  - missing source card fallback where callbacks still execute without ghost creation
- Synced Phase 02 ghost checklist by marking `Ghost drag UI/state integrity` as complete.

### Validation
- Passed focused run:
  - `tests/unit/hooks/useGhostDrag.test.js`
  - Aggregate: 3 tests passing.
- Passed adjacent drag regression run:
  - `tests/unit/hooks/useTopicGridDnD.test.js`
  - Aggregate: 4 tests passing.

## Additional progress (2026-03-08 - Read-Only Shared-Context Mutation Guards)
- Expanded `useHomePageHandlers` role-gate coverage for viewer-in-shared-folder guard branches:
  - `handleUpwardDrop` returns before event/mutation execution.
  - `handlePromoteFolderWrapper` blocks promote mutation path.
  - `handleTreeMoveSubject` blocks tree move mutation path.
- Scope remained test-only; production handler logic was unchanged.

### Validation
- Passed focused run:
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - `tests/unit/hooks/useGhostDrag.test.js`
  - Aggregate: 18 tests passing.

## Additional progress (2026-03-08 - Shortcut Deletion in Ghost Context)
- Expanded `useHomeHandlers` deletion coverage for shared-tree shortcut contexts:
  - `shortcut-subject` direct delete action still deletes the shortcut while nested in shared tree.
  - `shortcut-folder` direct delete action still deletes the shortcut while nested in shared tree.
- Preserved existing behavior where `unshare` remains blocked inside shared tree.
- Synced Phase 02 checklist item `Shortcut deletion in ghost mode` to complete.

### Validation
- Passed focused run:
  - `tests/unit/hooks/useHomeHandlers.shortcuts.test.js`
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - Aggregate: 26 tests passing.
