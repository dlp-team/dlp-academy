<!-- copilot/plans/active/e2e-home-firestore-tests-2026-04-16/phases/phase-05-bulk-operations.md -->
# Phase 5: Bulk Operations Tests

**Status:** `todo`  
**Depends on:** Phases 1, 2, 3  
**Test file:** `tests/e2e/home-bulk-operations.spec.js`  
**Commits target:** 3-5

---

## Objectives

Test Home page bulk selection mode and bulk actions: multi-select, bulk move, bulk delete, and create folder from selection.

## Test Cases

### 5.1 Enter Bulk Selection Mode
- **Precondition:** Multiple subjects and folders visible on Home page (seeded)
- **Action:** Long-press or use keyboard shortcut to enter selection mode
- **Verify:**
  - Selection checkboxes appear on all items
  - Bulk action toolbar becomes visible
  - Selection counter shows 0 selected
- **Cleanup:** Exit selection mode

### 5.2 Select Multiple Items
- **Precondition:** In bulk selection mode, multiple items visible
- **Action:** Click checkboxes on 3+ items (mix of subjects and folders)
- **Verify:**
  - Selection counter updates correctly
  - Selected items are visually highlighted
  - Bulk action buttons are enabled
- **Cleanup:** Exit selection mode

### 5.3 Bulk Move to Folder
- **Precondition:** 2 subjects + 1 target folder seeded; enter selection mode
- **Action:** Select 2 subjects → click "Move" → select target folder → confirm
- **Verify:**
  - Selected subjects disappear from current view
  - Subjects appear inside target folder
  - Firestore: both subjects' `parentId`/`folderId` updated to target folder ID
- **Cleanup:** Delete all test entities

### 5.4 Bulk Delete (Soft Delete)
- **Precondition:** 2 subjects + 1 folder seeded; enter selection mode
- **Action:** Select all 3 items → click "Delete" → confirm
- **Verify:**
  - All 3 items disappear from Home view
  - Firestore: all 3 docs have `status: "trashed"`, `trashedAt` set
- **Cleanup:** Hard-delete all from Firestore

### 5.5 Create Folder from Selection
- **Precondition:** 3 subjects at root level seeded; enter selection mode
- **Action:** Select 3 subjects → click "Create folder" / "Group into folder" → enter folder name → confirm
- **Verify:**
  - A new folder appears at root with the given name
  - All 3 subjects are now inside the new folder
  - Firestore: new folder doc created; all 3 subjects' `parentId` updated
- **Cleanup:** Delete new folder + all 3 subjects

### 5.6 Select All / Deselect All
- **Precondition:** Multiple items visible, in selection mode
- **Action:** Click "Select All" → verify all selected → click "Deselect All"
- **Verify:**
  - Select All: all items get checkmarks, counter matches total
  - Deselect All: all items unchecked, counter shows 0
- **Cleanup:** Exit selection mode, delete seeded items

## Validation Gate

- [ ] All 6 test cases pass
- [ ] Bulk move correctly updates multiple docs in single operation
- [ ] Bulk delete cascades correctly (folders with contents)
- [ ] Create folder from selection creates new folder doc + updates children
- [ ] No orphaned test data
- [ ] Commit and push completed

## Files Created/Modified

- `tests/e2e/home-bulk-operations.spec.js` (new)
