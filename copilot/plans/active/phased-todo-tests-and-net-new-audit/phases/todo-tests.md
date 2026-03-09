// tests/todo-tests.md
# Test Coverage Checklist (Deletion, Shortcuts, Ghost Mode)

## Ownership Transfer
- [ ] Transfer subject ownership: owner can transfer to valid shared user
- [ ] Transfer subject ownership: error on invalid user/self/permission
- [ ] Transfer folder ownership: owner can transfer to valid shared user
- [ ] Transfer folder ownership: error on invalid user/self/permission

## Advanced Shortcuts & Deletion
- [ ] Shortcut deduplication: Re-sharing same subject/folder does not create duplicate shortcuts
- [ ] Shortcut move: Moving shortcut between folders updates only shortcut, not source item
- [ ] Non-owner mutation denial: Attempting to mutate source entity as non-owner via shortcut context is blocked
- [ ] Orphan shortcut deletion: Deleting/unsharing source removes orphaned shortcuts for recipients
- [ ] Cross-view parity: All shortcut/deletion actions reflected identically in all UI views (grid/list/tree/manual/shared)
- [ ] Real-time sync: Deletion, shortcut creation, ghost actions reflected in real-time across all clients
- [ ] Breadcrumb navigation: Moving subjects between folders (shared/non-shared) prompts correct confirmation and updates only destination
- [ ] Idempotency: Re-running deletion/shortcut actions does not cause errors or duplicate effects
- [ ] Lecture mode: UI disables all mutation actions for read-only roles (student, viewer) in all modes
- [ ] Multi-step deletion: Deleting folder with nested shared subjects/topics/resources triggers correct cascade and permission checks

> **Last updated: 2026-03-07**

## Subject Deletion Coverage
- [x] Deletes subject itself (unit/e2e)
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

## Folder Deletion Coverage
- [x] Prevents folder deletion if not owner (unit)
- [ ] Delete folder only (subjects moved, no deletion)
- [ ] Delete folder and all contents (cascade)
- [ ] Unshare folder (shortcuts hidden/deleted)
- [ ] Folder deletion with shared subjects
- [ ] Folder deletion with ghost mode
- [ ] Folder deletion with orphaned shortcuts
- [ ] Folder deletion with missing institutionId
- [ ] Folder deletion with failed subject/shortcut deletion (error handling)

## Topic Deletion Coverage
- [ ] Deletes topic itself
- [ ] Deletes quizzes/resources inside topic
- [ ] Deletes documents inside topic
- [ ] Topic deletion when subject is deleted (cascade)
- [ ] Topic deletion with orphaned resources/quizzes/documents
- [ ] Topic deletion in ghost mode
- [ ] Topic deletion with missing institutionId
- [ ] Topic deletion with failed resource/document deletion (error handling)

## Shortcut Behavior Coverage
- [x] Manual visibility toggle for shortcut-folder (unit)
- [x] Unshare shortcut-subject when outside shared tree (unit)
- [x] Hide shortcut-folder via manual toggle (unit)
- [x] Prevents shortcut-folder unshare when nested in shared tree (unit)
- [x] Prevents shortcut-subject unshare when inside shared folder tree (unit)
- [ ] Delete shortcut to subject/folder/topic
- [ ] Shortcut owned by another user (permission denied)
- [ ] Shortcut deletion in ghost mode
- [ ] Shortcut deletion with missing institutionId
- [ ] Shortcut deletion with failed deletion (error handling)

## Ghost Mode Coverage
- [ ] Deleting subjects, folders, topics, shortcuts as ghost
- [ ] UI disables/enables actions correctly in ghost mode
- [ ] Data integrity after ghost actions
- [ ] Ghost drag: UI and state integrity
- [ ] Ghost drag: edge cases (drag orphan, drag shared, drag deleted)

## Permissions and Edge Cases
- [x] Permission checks for all roles (unit)
- [x] Owner/editor/viewer role guardrails (e2e)
- [x] Editor can create content in shared folder (e2e)
- [x] Viewer cannot create content in shared folder (e2e)
- [ ] Shared vs. non-shared folders/subjects/topics
- [ ] Manual order updates after deletion
- [ ] Cascade deletion (subject -> topics -> quizzes/resources -> documents)
- [ ] Error handling (failed deletions, partial failures)
- [ ] UI feedback (Spanish text, icons, no alerts)
- [ ] Deleting items with no children
- [ ] Deleting items with maximum children
- [ ] Deleting items with shortcuts only
- [ ] Deleting items with ghost mode enabled
- [ ] Drag-and-drop edge cases (ghost mode, shortcut, shared, orphan)
- [ ] Multi-institution boundary checks (deletion, shortcut, ghost)
- [ ] Real-time sync: deletion reflected across all clients

---

**Legend:**
- [x] Done (covered by existing tests)
- [ ] To Do (missing or incomplete)

**Update this file as tests are implemented or reviewed.**
