<!-- copilot/plans/active/e2e-home-firestore-tests-2026-04-16/phases/phase-04-sharing-permissions.md -->
# Phase 4: Sharing & Permissions Tests

**Status:** `todo`  
**Depends on:** Phases 1, 2  
**Test file:** `tests/e2e/home-sharing-operations.spec.js`  
**Commits target:** 3-5

---

## Objectives

Test sharing/unsharing of subjects and folders with different roles (editor, viewer), verify role enforcement, and test ownership transfer. Requires multi-account login (owner, editor, viewer).

## Test Cases

### 4.1 Share Subject as Editor
- **Precondition:** Owner has a subject; editor account exists
- **Action:** Owner → subject options → Share → enter editor email → set role "Editor" → confirm
- **Verify:**
  - Subject appears in editor's Shared tab after editor logs in
  - Firestore: editor's UID in `sharedWithUids` and `editorUids` arrays
  - Notification created in `notifications` collection for editor
- **Cleanup:** Unshare + delete subject + delete notification

### 4.2 Share Subject as Viewer
- **Precondition:** Owner has a subject; viewer account exists
- **Action:** Owner → share subject with viewer → set role "Viewer"
- **Verify:**
  - Subject appears in viewer's Shared tab
  - Firestore: viewer's UID in `sharedWithUids` and `viewerUids`
  - Viewer cannot edit subject (create button disabled / edit option absent)
- **Cleanup:** Unshare + delete subject

### 4.3 Unshare Subject
- **Precondition:** Subject shared with editor
- **Action:** Owner → subject options → Manage sharing → remove editor
- **Verify:**
  - Subject no longer appears in editor's Shared tab
  - Firestore: editor UID removed from `sharedWithUids`
- **Cleanup:** Delete subject

### 4.4 Share Folder
- **Precondition:** Owner has a folder with subjects inside
- **Action:** Owner → folder options → Share → add editor
- **Verify:**
  - Folder appears in editor's Shared tab
  - Editor can navigate into folder and see contents
  - Firestore: correct sharing arrays updated
- **Cleanup:** Unshare + delete folder and contents

### 4.5 Unshare Folder
- **Precondition:** Folder shared with viewer
- **Action:** Owner → folder options → Remove sharing for viewer
- **Verify:**
  - Folder removed from viewer's Shared tab
  - Viewer can no longer access folder contents
- **Cleanup:** Delete folder

### 4.6 Transfer Subject Ownership
- **Precondition:** Owner has a subject, editor account exists
- **Action:** Owner → subject options → Transfer ownership → select editor as new owner → confirm
- **Verify:**
  - Subject now shows as owned by editor (editor sees it in "My Subjects")
  - Original owner no longer sees it as owned (may see as shared if auto-shared back)
  - Firestore: `ownerId` changed to editor's UID
- **Cleanup:** Delete subject via Admin SDK (regardless of current owner)

### 4.7 Transfer Folder Ownership
- **Precondition:** Owner has a folder, editor account exists
- **Action:** Owner → folder options → Transfer ownership → select editor
- **Verify:**
  - Folder ownership transferred in Firestore
  - Editor can manage folder
- **Cleanup:** Delete folder via Admin SDK

### 4.8 Editor Role Enforcement
- **Precondition:** Subject shared with editor role
- **Action:** Log in as editor → navigate to shared subject
- **Verify:**
  - Editor CAN edit subject content (topics, resources)
  - Editor CANNOT delete the subject
  - Editor CANNOT transfer ownership
- **Cleanup:** Unshare + delete subject

### 4.9 Viewer Role Enforcement
- **Precondition:** Subject shared with viewer role
- **Action:** Log in as viewer → navigate to shared subject
- **Verify:**
  - Viewer CAN view subject content
  - Viewer CANNOT edit, delete, or share
  - Create/edit buttons not visible or disabled
- **Cleanup:** Unshare + delete subject

## Validation Gate

- [ ] All 9 test cases pass with multi-account environment
- [ ] Sharing correctly updates Firestore arrays (sharedWithUids, editorUids, viewerUids)
- [ ] Notifications created on share events
- [ ] Role enforcement prevents unauthorized actions
- [ ] Ownership transfer correctly changes ownerId
- [ ] No orphaned test data or notifications
- [ ] Commit and push completed

## Files Created/Modified

- `tests/e2e/home-sharing-operations.spec.js` (new)
