<!-- copilot/plans/active/e2e-home-firestore-tests-2026-04-16/phases/phase-03-folder-crud.md -->
# Phase 3: Folder CRUD Tests

**Status:** `todo`  
**Depends on:** Phase 1  
**Test file:** `tests/e2e/home-folder-crud.spec.js`  
**Commits target:** 3-5

---

## Objectives

Test every Firestore write/modify/delete operation for folders triggered from the Home page. Includes nested folder operations and move operations between folders.

## Test Cases

### 3.1 Create Folder
- **Precondition:** Logged in as owner, on Home page root level
- **Action:** Click "Crear carpeta" button → enter folder name → submit
- **Verify:**
  - New folder appears in Home view
  - Folder document exists in Firestore with correct fields (name, ownerId, parentId: null, status: active)
- **Cleanup:** Delete created folder via Admin SDK

### 3.2 Create Nested Folder
- **Precondition:** Parent folder exists (seeded)
- **Action:** Navigate into parent folder → create new folder inside
- **Verify:**
  - New folder appears inside parent
  - Firestore doc has correct `parentId` pointing to parent folder
- **Cleanup:** Delete both child and parent folders

### 3.3 Update Folder Name
- **Precondition:** Test folder seeded via Admin SDK
- **Action:** Open folder options menu → Rename → change name → save
- **Verify:**
  - Updated name appears in UI
  - Firestore document reflects new name
- **Cleanup:** Delete seeded folder

### 3.4 Move Subject into Folder
- **Precondition:** Test subject + test folder seeded
- **Action:** Use options menu on subject → Move to folder → select target folder → confirm
- **Verify:**
  - Subject appears inside folder when navigating into it
  - Subject's `parentId` / `folderId` updated in Firestore
- **Cleanup:** Delete subject and folder

### 3.5 Move Folder into Another Folder (Nest)
- **Precondition:** Two folders seeded at root level
- **Action:** Move folder A into folder B via options menu
- **Verify:**
  - Folder A appears inside Folder B
  - Folder A's `parentId` updated in Firestore
- **Cleanup:** Delete both folders

### 3.6 Move Item Back to Root
- **Precondition:** Subject inside a folder (seeded)
- **Action:** Navigate into folder → move subject to root (breadcrumb drop or menu)
- **Verify:**
  - Subject appears at root level
  - Subject's `parentId` set to null in Firestore
- **Cleanup:** Delete subject and folder

### 3.7 Soft-Delete Folder
- **Precondition:** Folder with contents seeded (folder + subjects inside)
- **Action:** Delete folder from options menu → confirm
- **Verify:**
  - Folder disappears from Home view
  - Folder document: `status: "trashed"`, `trashedAt` set
  - Contents inside are also trashed (cascade soft delete)
- **Cleanup:** Hard-delete all from Firestore

### 3.8 Restore Folder from Trash
- **Precondition:** Trashed folder seeded (status: trashed)
- **Action:** Navigate to Bin view → find folder → Restore
- **Verify:**
  - Folder reappears on Home page
  - Folder + contents `status: "active"`
- **Cleanup:** Delete all test entities

## Validation Gate

- [ ] All 8 test cases pass with `E2E_RUN_MUTATIONS=true`
- [ ] Move operations correctly update Firestore `parentId`
- [ ] Cascade soft-delete verified (folder contents also trashed)
- [ ] No orphaned test data after suite completion
- [ ] Commit and push completed

## Files Created/Modified

- `tests/e2e/home-folder-crud.spec.js` (new)
