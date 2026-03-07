<!-- copilot/plans/active/phased-todo-tests-and-net-new-audit/phases/phase-02-ownership-deletion-shortcuts-ghost.md -->
# Phase 02 - Ownership, Deletion, Shortcuts, and Ghost Backlog

## Ownership transfer
- [ ] Transfer subject ownership: owner can transfer to valid shared user
- [ ] Transfer subject ownership: error on invalid user/self/permission
- [ ] Transfer folder ownership: owner can transfer to valid shared user
- [ ] Transfer folder ownership: error on invalid user/self/permission

## Advanced shortcuts and deletion behavior
- [ ] Shortcut deduplication: re-sharing same subject/folder does not create duplicate shortcuts
- [ ] Shortcut move: moving shortcut between folders updates only shortcut, not source item
- [ ] Non-owner mutation denial via shortcut context
- [ ] Orphan shortcut deletion when source is deleted/unshared
- [ ] Cross-view parity across grid/list/tree/manual/shared
- [ ] Real-time sync for deletion/shortcut/ghost actions
- [ ] Breadcrumb behavior for shared and non-shared moves
- [ ] Idempotency for rerun deletion/shortcut actions
- [ ] Lecture mode disables mutation for read-only roles
- [ ] Multi-step deletion with nested shared subjects/topics/resources

## Subject deletion coverage
- [ ] Deletes all topics inside subject (cascade)
- [ ] Deletes all quizzes/resources inside topics
- [ ] Deletes all shortcuts pointing to subject
- [ ] Deletes all documents inside topics (cascade)
- [ ] Subject deletion in shared folder (permission checks)
- [ ] Subject deletion with multiple owners/editors
- [ ] Subject deletion with orphaned shortcuts
- [ ] Subject deletion in ghost mode
- [ ] Subject deletion with missing institutionId
- [ ] Subject deletion with failed topic/document/shortcut deletion (error handling)

## Folder deletion coverage
- [ ] Delete folder only (subjects moved, no deletion)
- [ ] Delete folder and all contents (cascade)
- [ ] Unshare folder (shortcuts hidden/deleted)
- [ ] Folder deletion with shared subjects
- [ ] Folder deletion with ghost mode
- [ ] Folder deletion with orphaned shortcuts
- [ ] Folder deletion with missing institutionId
- [ ] Folder deletion with failed subject/shortcut deletion (error handling)

## Topic deletion coverage
- [ ] Deletes topic itself
- [ ] Deletes quizzes/resources inside topic
- [ ] Deletes documents inside topic
- [ ] Topic deletion when subject is deleted (cascade)
- [ ] Topic deletion with orphaned resources/quizzes/documents
- [ ] Topic deletion in ghost mode
- [ ] Topic deletion with missing institutionId
- [ ] Topic deletion with failed resource/document deletion (error handling)

## Shortcut behavior coverage
- [ ] Delete shortcut to subject/folder/topic
- [ ] Shortcut owned by another user (permission denied)
- [ ] Shortcut deletion in ghost mode
- [ ] Shortcut deletion with missing institutionId
- [ ] Shortcut deletion with failed deletion (error handling)

## Ghost mode coverage
- [ ] Deleting subjects, folders, topics, shortcuts as ghost
- [ ] UI disables/enables actions correctly in ghost mode
- [ ] Data integrity after ghost actions
- [ ] Ghost drag UI/state integrity
- [ ] Ghost drag edge cases (orphan/shared/deleted)

## Permissions and edge cases
- [ ] Shared vs non-shared folders/subjects/topics
- [ ] Manual order updates after deletion
- [ ] Cascade deletion (subject -> topics -> quizzes/resources -> documents)
- [ ] Error handling for partial failures
- [ ] UI feedback validation (Spanish text, icons, no alerts)
- [ ] Deleting items with no children
- [ ] Deleting items with maximum children
- [ ] Deleting items with shortcuts only
- [ ] Deleting items with ghost mode enabled
- [ ] Drag-and-drop edge cases (ghost/shortcut/shared/orphan)
- [ ] Multi-institution boundary checks (deletion/shortcut/ghost)
- [ ] Real-time sync reflected across all clients
