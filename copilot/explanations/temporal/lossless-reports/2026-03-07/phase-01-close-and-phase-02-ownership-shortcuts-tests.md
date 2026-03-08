<!-- copilot/explanations/temporal/lossless-reports/2026-03-07/phase-01-close-and-phase-02-ownership-shortcuts-tests.md -->
# Lossless Change Report - Phase 01 Closure and Phase 02 Progress

## Requested Scope
- Close remaining Phase 01 test gap: auth-listener fallback behavior in `src/App.jsx`.
- Continue Phase 02 with as much implementation as possible, prioritizing ownership transfer, shortcut behavior, and folder deletion behavior.

## Preserved Behaviors
- Existing hook logic in `src/hooks/useSubjects.js`, `src/hooks/useFolders.js`, and `src/hooks/useShortcuts.js` was not modified.
- Existing E2E coverage and previously added Phase 01 utility/hook tests were preserved.
- Existing plan files and phase backlog content were preserved except explicit status/checklist updates.

## Touched Files
- `tests/unit/App.authListener.test.jsx`
- `tests/unit/hooks/useSubjects.test.js`
- `tests/unit/hooks/useFolders.test.js`
- `tests/unit/hooks/useShortcuts.test.js`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-01-core-routing-session-theme-utilities.md`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-02-ownership-deletion-shortcuts-ghost.md`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/README.md`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/strategy-roadmap.md`

## File-by-File Verification
- `tests/unit/App.authListener.test.jsx`
  - Added unit coverage that simulates `onAuthStateChanged` success + `users/{uid}` snapshot failure.
  - Verified fallback keeps session usable and renders protected `/home` route with Firebase auth fields.
- `tests/unit/hooks/useSubjects.test.js`
  - Added positive ownership transfer test with shortcut creation for previous owner.
  - Added negative test for transfer to non-shared recipient.
- `tests/unit/hooks/useFolders.test.js`
  - Expanded Firestore mocks to support batch operations and ownership transfer assertions.
  - Added `deleteFolderOnly` behavior test (re-parent children, delete selected folder only).
  - Added positive ownership transfer and same-user rejection tests.
- `tests/unit/hooks/useShortcuts.test.js`
  - Added new suite for `moveShortcut`, `deleteShortcut`, ID validation, and `deleteOrphanedShortcuts` behavior.
- Plan docs
  - Marked Phase 01 fully complete.
  - Marked completed Phase 02 checklist items (ownership transfer positive paths, shortcut move, orphan cleanup, delete folder only, shortcut deletion).
  - Updated active plan README and roadmap to current phase and actual artifacts.

## Validation Summary
- Targeted test run passed:
  - `npm run test -- tests/unit/App.authListener.test.jsx tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useFolders.test.js tests/unit/hooks/useShortcuts.test.js`
  - Result: 4 files passed, 18 tests passed.
- Static problems check:
  - `get_errors` on all touched test files returned no errors.

## Lossless Outcome
- Requested behaviors were added as tests and plan status updates without modifying production hook/app logic.
- No unrelated features, components, or workflows were changed.

## Additional Progress Update (2026-03-08)

### Additional Requested Scope Progressed
- Continue Phase 02 by covering remaining ownership transfer error branches and shortcut deduplication behavior.

### Additional Files Updated
- `tests/unit/hooks/useSubjects.test.js`
- `tests/unit/hooks/useFolders.test.js`
- `tests/unit/hooks/useShortcuts.test.js`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-02-ownership-deletion-shortcuts-ghost.md`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/strategy-roadmap.md`

### Additional Verification
- Targeted test run passed:
  - `npm run test -- tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useFolders.test.js tests/unit/hooks/useShortcuts.test.js`
  - Result: 3 files passed, 23 tests passed.

### Additional Completed Coverage
- `useSubjects.transferSubjectOwnership`: self-recipient, missing-subject, and non-owner rejection branches.
- `useFolders.transferFolderOwnership`: non-owner and non-shared-recipient rejection branches.
- `useShortcuts.createShortcut`: dedup branch updates primary shortcut and deletes duplicates without creating new shortcut.

## Additional Progress Update (2026-03-08 - Cascade Deletion)

### Additional Files Updated
- `tests/unit/hooks/useSubjects.test.js`
- `tests/unit/hooks/useFolders.test.js`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-02-ownership-deletion-shortcuts-ghost.md`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/strategy-roadmap.md`

### Additional Verification
- Targeted run passed:
  - `npm run test -- tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useFolders.test.js`
  - Result: 2 files passed, 21 tests passed.
- Consolidated run passed:
  - `npm run test -- tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useFolders.test.js tests/unit/hooks/useShortcuts.test.js`
  - Result: 3 files passed, 26 tests passed.

### Additional Completed Coverage
- `useFolders.deleteFolder`: recursive cascade deletion covers nested folders and nested subjects.
- `useSubjects.permanentlyDeleteSubject`: cascades topic, topic-document, owner shortcut, and subject deletion.

## Additional Progress Update (2026-03-08 - Shortcut Permission and Partial Failure)

### Additional Files Updated
- `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
- `tests/unit/hooks/useSubjects.test.js`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-02-ownership-deletion-shortcuts-ghost.md`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/strategy-roadmap.md`

### Additional Verification
- Targeted run passed:
  - `npm run test -- tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js tests/unit/hooks/useSubjects.test.js`
  - Result: 2 files passed, 25 tests passed.

### Additional Completed Coverage
- `useHomePageHandlers` shortcut context:
  - viewer inside shared folder cannot promote subject shortcut upward (no mutation path executed)
  - shortcut drag move updates shortcut only and does not mutate source subject
- `useSubjects.permanentlyDeleteSubject` partial failure handling:
  - continues and completes subject deletion when topic documents query fails for one topic
  - continues when document and shortcut deletion operations fail for individual items

## Additional Progress Update (2026-03-08 - Folder Partial Failure Resilience)

### Additional Files Updated
- `tests/unit/hooks/useFolders.test.js`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/strategy-roadmap.md`

### Additional Verification
- Focused run passed:
  - `npm run test -- tests/unit/hooks/useFolders.test.js`
  - Result: 1 file passed, 10 tests passed.

### Additional Completed Coverage
- `useFolders.deleteFolder`: still deletes target folder and commits batch when child subject/folder queries fail.
- `useFolders.deleteFolderOnly`: still deletes target folder and commits batch when move queries fail.

## Additional Progress Update (2026-03-08 - Subject Resource/Quiz Cascade)

### Additional Files Updated
- `src/hooks/useSubjects.js`
- `tests/unit/hooks/useSubjects.test.js`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-02-ownership-deletion-shortcuts-ghost.md`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/strategy-roadmap.md`

### Additional Verification
- Focused run passed:
  - `npm run test -- tests/unit/hooks/useSubjects.test.js`
  - Result: 1 file passed, 14 tests passed.

### Additional Completed Coverage
- `useSubjects.permanentlyDeleteSubject` now attempts and tolerates partial failures for:
  - `documents` per topic,
  - `resumen` resources per topic,
  - `quizzes` per topic,
  - topic deletion,
  - owner shortcut deletion,
  - final subject deletion.

## Additional Progress Update (2026-03-08 - Shortcut Idempotency and Permission Denial)

### Additional Files Updated
- `tests/unit/hooks/useShortcuts.test.js`
- `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-02-ownership-deletion-shortcuts-ghost.md`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/strategy-roadmap.md`

### Additional Verification
- Focused run passed:
  - `npm run test -- tests/unit/hooks/useShortcuts.test.js tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - Result: 2 files passed, 20 tests passed.

### Additional Completed Coverage
- `useShortcuts.deleteOrphanedShortcuts` idempotency:
  - first cleanup removes orphan shortcuts,
  - rerun returns zero deletions and performs no extra deletes.
- `useShortcuts.deleteShortcut` failure path:
  - Firestore permission-denied errors bubble to caller for owner-mismatch/authorization scenarios.
- `useHomePageHandlers` owner-mismatch guard:
  - non-editor cannot move a subject out of a shared source folder.
  - repeated drop into the same folder remains a no-op (idempotent behavior).

## Additional Progress Update (2026-03-08 - Folder Delete Rerun No-Op)

### Additional Files Updated
- `tests/unit/hooks/useFolders.test.js`

### Additional Verification
- Focused run passed:
  - `npm run test -- tests/unit/hooks/useFolders.test.js`
  - Result: 1 file passed, 12 tests passed.
- Consolidated run passed:
  - `npm run test -- tests/unit/hooks/useFolders.test.js tests/unit/hooks/useShortcuts.test.js tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - Result: 3 files passed, 32 tests passed.

### Additional Completed Coverage
- `useFolders.deleteFolder` idempotent no-op when folder is already missing.
- `useFolders.deleteFolderOnly` idempotent no-op when folder is already missing.

## Additional Progress Update (2026-03-08 - Topic Delete Cascade and Resilience)

### Additional Files Updated
- `src/pages/Topic/hooks/useTopicLogic.js`
- `tests/unit/hooks/useTopicLogic.test.js`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-02-ownership-deletion-shortcuts-ghost.md`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/strategy-roadmap.md`

### Additional Verification
- Focused run passed:
  - `npm run test -- tests/unit/hooks/useTopicLogic.test.js`
  - Result: 1 file passed, 8 tests passed.
- Consolidated run passed:
  - `npm run test -- tests/unit/hooks/useTopicLogic.test.js tests/unit/hooks/useFolders.test.js tests/unit/hooks/useShortcuts.test.js tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - Result: 4 files passed, 40 tests passed.

### Additional Completed Coverage
- `useTopicLogic.handleDeleteTopic` now performs best-effort cleanup for topic-linked:
  - `documents`,
  - `resumen`,
  - `quizzes`,
  before deleting the topic and navigating back to subject.
- Query and per-item deletion failures are tolerated and logged without blocking final topic deletion.

## Additional Progress Update (2026-03-08 - Missing InstitutionId Deletion Variants)

### Additional Files Updated
- `tests/unit/hooks/useSubjects.test.js`
- `tests/unit/hooks/useFolders.test.js`
- `tests/unit/hooks/useShortcuts.test.js`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-02-ownership-deletion-shortcuts-ghost.md`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/strategy-roadmap.md`

### Additional Verification
- Focused combined run passed:
  - `npm run test -- tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useFolders.test.js tests/unit/hooks/useShortcuts.test.js`
  - Result: 3 files passed, 37 tests passed.

### Additional Completed Coverage
- `useSubjects.permanentlyDeleteSubject`: deletes subject successfully when institution metadata is missing.
- `useFolders.deleteFolder` / `deleteFolderOnly`: deletion flows still execute when folder institution metadata is missing.
- `useShortcuts.deleteOrphanedShortcuts`: orphan cleanup still deletes shortcuts with missing institution metadata.
- Checklist sync also marks subject-delete-triggered topic cascade coverage based on existing `useSubjects` cascade tests.

## Additional Progress Update (2026-03-08 - Folder Deletion Failure Resilience)

### Additional Files Updated
- `src/hooks/useFolders.js`
- `tests/unit/hooks/useFolders.test.js`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-02-ownership-deletion-shortcuts-ghost.md`
- `copilot/plans/active/phased-todo-tests-and-net-new-audit/strategy-roadmap.md`

### Additional Verification
- Focused run passed:
  - `npm run test -- tests/unit/hooks/useFolders.test.js`
  - Result: 1 file passed, 18 tests passed.
- Consolidated run passed:
  - `npm run test -- tests/unit/hooks/useFolders.test.js tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useShortcuts.test.js tests/unit/hooks/useTopicLogic.test.js tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - Result: 5 files passed, 62 tests passed.

### Additional Completed Coverage
- `useFolders.deleteFolder` now includes best-effort shortcut cleanup and commit-failure fallback root folder deletion.
- `useFolders.deleteFolderOnly` now includes best-effort shortcut cleanup and continues deleting the folder if the pre-delete move batch commit fails.
- Added failure-path tests for:
  - batch commit failure fallback,
  - shortcut cleanup failure tolerance,
  - existing query-failure tolerance with new shortcut cleanup paths.
