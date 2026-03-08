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
