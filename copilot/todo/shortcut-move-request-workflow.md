# Shortcut Move Request Workflow TODO

- [ ] Create backend endpoint/function to submit a `shortcutMoveRequest` when user confirms request from Home modal.
- [ ] Persist request fields: requesterUid, requesterEmail, shortcutId, shortcutType, targetId, targetFolderId, targetFolderOwnerUid, status, createdAt.
- [ ] Send email notification to target folder owner when request is created.
- [ ] Add in-app notification for target folder owner (pending notification system).
- [ ] Build owner review UI (approve / reject) for move requests.
- [ ] On owner approval: move original source item (subject/folder) to shared folder; never move shortcut into shared folder.
- [ ] On rejection: notify requester and keep shortcut in original manual location.
- [ ] Add audit log entry for request creation and resolution.
- [ ] Add security rules for request creation/read/update scoped to requester + owner + admins.

> Context: Shortcut items must never be moved into shared folders directly from drag-and-drop.
