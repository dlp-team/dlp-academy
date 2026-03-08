<!-- copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-02-ownership-deletion-shortcuts-ghost.md -->
# Phase 02 - Ownership, Deletion, Shortcuts, and Ghost Backlog

## Ownership transfer
- [x] Transfer subject ownership: owner can transfer to valid shared user
- [x] Transfer subject ownership: error on invalid user/self/permission
- [x] Transfer folder ownership: owner can transfer to valid shared user
- [x] Transfer folder ownership: error on invalid user/self/permission

## Advanced shortcuts and deletion behavior
- [x] Shortcut deduplication: re-sharing same subject/folder does not create duplicate shortcuts
- [x] Shortcut move: moving shortcut between folders updates only shortcut, not source item
- [x] Non-owner mutation denial via shortcut context
- [x] Orphan shortcut deletion when source is deleted/unshared
- [ ] Cross-view parity across grid/list/tree/manual/shared
- [ ] Real-time sync for deletion/shortcut/ghost actions
- [ ] Breadcrumb behavior for shared and non-shared moves
- [x] Idempotency for rerun deletion/shortcut actions
- [ ] Lecture mode disables mutation for read-only roles
- [ ] Multi-step deletion with nested shared subjects/topics/resources

## Subject deletion coverage
- [x] Deletes all topics inside subject (cascade)
- [x] Deletes all quizzes/resources inside topics
- [x] Deletes all shortcuts pointing to subject
- [x] Deletes all documents inside topics (cascade)
- [ ] Subject deletion in shared folder (permission checks)
- [ ] Subject deletion with multiple owners/editors
- [ ] Subject deletion with orphaned shortcuts
- [ ] Subject deletion in ghost mode
- [x] Subject deletion with missing institutionId
- [x] Subject deletion with failed topic/document/shortcut deletion (error handling)

## Folder deletion coverage
- [x] Delete folder only (subjects moved, no deletion)
- [x] Delete folder and all contents (cascade)
- [ ] Unshare folder (shortcuts hidden/deleted)
- [ ] Folder deletion with shared subjects
- [ ] Folder deletion with ghost mode
- [ ] Folder deletion with orphaned shortcuts
- [x] Folder deletion with missing institutionId
- [x] Folder deletion with failed subject/shortcut deletion (error handling)

## Topic deletion coverage
- [x] Deletes topic itself
- [x] Deletes quizzes/resources inside topic
- [x] Deletes documents inside topic
- [x] Topic deletion when subject is deleted (cascade)
- [x] Topic deletion with orphaned resources/quizzes/documents
- [ ] Topic deletion in ghost mode
- [x] Topic deletion with missing institutionId
- [x] Topic deletion with failed resource/document deletion (error handling)

## Shortcut behavior coverage
- [x] Delete shortcut to subject/folder/topic
- [x] Shortcut owned by another user (permission denied)
- [x] Shortcut deletion in ghost mode
- [x] Shortcut deletion with missing institutionId
- [x] Shortcut deletion with failed deletion (error handling)

## Ghost mode coverage
- [ ] Deleting subjects, folders, topics, shortcuts as ghost
- [ ] UI disables/enables actions correctly in ghost mode
- [ ] Data integrity after ghost actions
- [x] Ghost drag UI/state integrity
- [ ] Ghost drag edge cases (orphan/shared/deleted)

## Permissions and edge cases
- [ ] Shared vs non-shared folders/subjects/topics
- [ ] Manual order updates after deletion
- [x] Cascade deletion (subject -> topics -> quizzes/resources -> documents)
- [ ] Error handling for partial failures
- [ ] UI feedback validation (Spanish text, icons, no alerts)
- [ ] Deleting items with no children
- [ ] Deleting items with maximum children
- [ ] Deleting items with shortcuts only
- [ ] Deleting items with ghost mode enabled
- [ ] Drag-and-drop edge cases (ghost/shortcut/shared/orphan)
- [ ] Multi-institution boundary checks (deletion/shortcut/ghost)
- [ ] Real-time sync reflected across all clients
