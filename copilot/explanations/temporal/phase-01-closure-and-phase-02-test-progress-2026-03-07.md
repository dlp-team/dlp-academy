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

## Additional progress (2026-03-08 - Subject Deletion Orphan/Ghost Shortcut Scope)
- Added `useSubjects.permanentlyDeleteSubject` coverage that validates owner-scoped shortcut cleanup:
  - deletion query includes `ownerId === currentUser.uid`
  - owner shortcut is deleted
  - non-owner recipient ghost/orphan shortcuts are not targeted by the owner cleanup path
- Synced Phase 02 checklist item `Subject deletion with orphaned shortcuts` to complete.

### Validation
- Passed focused run:
  - `tests/unit/hooks/useSubjects.test.js`
  - `tests/unit/hooks/useFolders.test.js`
  - `tests/unit/hooks/useTopicLogic.test.js`
  - Aggregate: 44 tests passing.

## Additional progress (2026-03-09 - Topic Ghost/Read-Only Deletion Guard)
- Hardened `useTopicLogic.handleDeleteTopic` with a permission gate:
  - returns early when `canDelete(topic, user)` is false,
  - prevents deletion mutation execution from ghost/read-only contexts.
- Expanded topic tests to cover both sides of the gate:
  - delete-enabled flows explicitly set `canDelete = true`,
  - new read-only/ghost-mode test asserts no confirm prompt, no topic delete, and no navigation.
- Synced Phase 02 checklist item `Topic deletion in ghost mode` to complete.

### Validation
- Passed focused run:
  - `tests/unit/hooks/useTopicLogic.test.js`
  - `tests/unit/hooks/useSubjects.test.js`
  - `tests/unit/hooks/useFolders.test.js`
  - Aggregate: 45 tests passing.

## Additional progress (2026-03-09 - Bulk Phase 02 Deletion/Manual-Order Batch)
- Added a multi-scenario coverage batch across Home/Folders/Subjects to reduce premium-request fragmentation:
  - `useHomeHandlers`: subject/folder deletion manual-order updates, folder-all/folder-only owner and non-owner paths.
  - `useSubjects`: shared-folder collaborator rejection for permanent delete, owner delete allowed for multi-editor/viewer shared subjects.
  - `useFolders`: shared-subject cascade deletion and owner-scoped shortcut cleanup preserving recipient orphan entries.
- Synced Phase 02 checklist updates:
  - subject deletion permission + multi-editor cases,
  - folder deletion with shared subjects + orphaned shortcuts,
  - manual order deletion updates,
  - deleting items with shortcuts-only behavior.

### Validation
- Passed consolidated run:
  - `tests/unit/hooks/useHomeHandlers.shortcuts.test.js`
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - `tests/unit/hooks/useSubjects.test.js`
  - `tests/unit/hooks/useFolders.test.js`
  - `tests/unit/hooks/useTopicLogic.test.js`
  - Aggregate: 81 tests passing.

## Additional progress (2026-03-09 - Ghost Drag Edge-Case Batch)
- Expanded `useGhostDrag` with 10 additional tests targeting edge behavior and branch hardening:
  - transparent native drag-preview suppression via `setDragImage`
  - transform-origin offset correctness
  - interference-class stripping on cloned ghost nodes
  - fixed visual style assertions for ghost rendering
  - pointer-axis zero guards (`clientX = 0` and `clientY = 0`) as explicit no-op paths
  - callback optionality and event payload integrity for start/end handlers
- Synced Phase 02 checklist by marking `Ghost drag edge cases (orphan/shared/deleted)` as complete.

### Validation
- Passed consolidated run:
  - `tests/unit/hooks/useGhostDrag.test.js`
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - `tests/unit/hooks/useHomeHandlers.shortcuts.test.js`
  - `tests/unit/hooks/useSubjects.test.js`
  - `tests/unit/hooks/useFolders.test.js`
  - `tests/unit/hooks/useTopicLogic.test.js`
  - Aggregate: 104 tests passing.

## Additional progress (2026-03-09 - Phase 02 Ten-Task Ghost/Shared Completion Batch)
- Hardened `useHomeHandlers.handleDelete` with explicit subject-owner gating so non-owner/ghost read-only flows cannot trigger subject deletion.
- Expanded `useHomeHandlers` shortcut deletion coverage for ghost-mode integrity:
  - non-owner subject deletion blocked,
  - owner subject deletion still updates manual order,
  - shortcut-folder unshare blocked in shared-tree ghost context,
  - shortcut-folder unshare outside shared tree keeps shortcut-link mutation behavior lossless.
- Expanded `useHomePageHandlers` drag/drop and breadcrumb parity coverage:
  - breadcrumb non-shared move direct path,
  - breadcrumb shared->private unshare callback path,
  - nest-folder shared->private unshare callback path,
  - promote-folder shared->private unshare callback path,
  - direct subject move in non-shared source/target path without share prompts.
- Synced exactly 10 Phase 02 checklist items to complete, including:
  - breadcrumb shared/non-shared behavior,
  - subject/folder ghost deletion coverage,
  - folder unshare shortcut ghost mode,
  - ghost-mode deletion matrix/data integrity/UI gating,
  - shared vs non-shared parity,
  - partial-failure handling and ghost-enabled deletion item.

### Validation
- Passed consolidated run:
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - `tests/unit/hooks/useHomeHandlers.shortcuts.test.js`
  - `tests/unit/hooks/useSubjects.test.js`
  - `tests/unit/hooks/useFolders.test.js`
  - `tests/unit/hooks/useTopicLogic.test.js`
  - `tests/unit/hooks/useGhostDrag.test.js`
  - Aggregate: 113 tests passing.

## Additional progress (2026-03-09 - Phase 02 Full Closure Batch)
- Closed all remaining unchecked items in the Phase 02 checklist with targeted validation additions:
  - cross-view parity and drag/drop orphan/shortcut/shared edge branches,
  - read-only/lecture-mode mutation blocking via keyboard shortcut paths,
  - no-alert Spanish feedback validation,
  - no-children and max-children deletion fan-out coverage,
  - realtime sync + tenant-boundary shortcut resolution behavior.
- Added test scenarios in:
  - `tests/unit/hooks/useHomeKeyboardShortcuts.test.js`
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - `tests/unit/hooks/useSubjects.test.js`
  - `tests/unit/hooks/useShortcuts.test.js`

### Validation
- Passed consolidated run:
  - `tests/unit/hooks/useHomeKeyboardShortcuts.test.js`
  - `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`
  - `tests/unit/hooks/useHomeHandlers.shortcuts.test.js`
  - `tests/unit/hooks/useSubjects.test.js`
  - `tests/unit/hooks/useFolders.test.js`
  - `tests/unit/hooks/useTopicLogic.test.js`
  - `tests/unit/hooks/useGhostDrag.test.js`
  - `tests/unit/hooks/useShortcuts.test.js`
  - Aggregate: 143 tests passing.

## Additional progress (2026-03-09 - Phase 03 Completion Batch)
- Completed all Phase 03 checklist items with new unit and E2E coverage:
  - settings reload continuity coverage in `tests/e2e/profile-settings.spec.js`,
  - study-guide content-route/editor lifecycle and invalid-resource fallback in `tests/e2e/subject-topic-content.spec.js`,
  - profile modal save/cancel/image-preview flow in `tests/unit/pages/profile/EditProfileModal.test.jsx`,
  - study-guide missing/partial payload fallbacks in `tests/unit/pages/content/StudyGuide.fallback.test.jsx`.
- Updated planning status:
  - `phase-03-user-and-content-experience.md` fully checked,
  - `strategy-roadmap.md` set Phase 03 to **COMPLETED** and advanced next actions to Phase 04/05.

### Validation
- Unit:
  - `npm run test:unit tests/unit/pages/profile/EditProfileModal.test.jsx tests/unit/pages/content/StudyGuide.fallback.test.jsx`
  - Result: 2 files passed, 5 tests passed.
- E2E:
  - `npm run test:e2e tests/e2e/profile-settings.spec.js tests/e2e/subject-topic-content.spec.js`
  - Result: 7 passed.

## Additional progress (2026-03-09 - Phase 04 and 05 Completion Batch)
- Completed Phase 04 admin/security reinforcement:
  - added `SudoModal` unit coverage for wrong-password block and successful reauth flow,
  - strengthened admin guardrails E2E to verify policy success messaging appears only after sudo confirmation.
- Completed Phase 05 Firestore rules expansion:
  - expanded `tests/rules/firestore.rules.test.js` with `institution_invites` create/get/list/update/delete boundaries,
  - added institution + role enforcement coverage for `folders`, `topics`, `documents` (resources), and `quizzes`,
  - enforced and validated deny paths for non-admin writes with missing/mismatched `institutionId`.
- Updated planning status:
  - `phase-04-admin-and-security-reinforcement.md` fully checked,
  - `phase-05-firestore-rules-expansion.md` fully checked,
  - roadmap set Phase 04 and Phase 05 to **COMPLETED**.

### Validation
- Unit:
  - `npm run test:unit tests/unit/components/SudoModal.test.jsx`
  - Result: 1 file passed, 2 tests passed.
- E2E (delta-focused):
  - `npm run test:e2e tests/e2e/admin-guardrails.spec.js -- --grep "institution admin can save access policies"`
  - Result: 1 passed.
- Rules integration:
  - `npm run test:rules`
  - Result: 1 file passed, 10 tests passed.

## Additional progress (2026-03-09 - Final Full-Test Sweep)
- Fixed one unit regression discovered by full-suite execution:
  - restored `resolvedShortcuts` exposure from `useHomeState` through `useHomeLogic`.
- Stabilized branding E2E selector path to current customization UI.

### Validation
- Unit full run:
  - `npm run test`
  - Result: 42 files passed, 271 tests passed.
- Rules full run:
  - `npm run test:rules`
  - Result: 1 file passed, 10 tests passed.
- E2E full run:
  - `npm run test:e2e`
  - Result: 26 passed, 4 skipped, 2 failed.
  - Remaining failures are login-timeout fixture issues in:
    - `tests/e2e/admin-guardrails.spec.js` (`editor cannot access privileged dashboard routes`),
    - `tests/e2e/home-sharing-roles.spec.js` (`editor can create content inside designated shared folder`).
