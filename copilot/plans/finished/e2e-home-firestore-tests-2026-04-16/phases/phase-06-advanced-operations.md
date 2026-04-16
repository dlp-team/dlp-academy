<!-- copilot/plans/active/e2e-home-firestore-tests-2026-04-16/phases/phase-06-advanced-operations.md -->
# Phase 6: Advanced Operations Tests

**Status:** `todo`  
**Depends on:** Phases 1, 2, 3  
**Test file:** `tests/e2e/home-advanced-operations.spec.js`  
**Commits target:** 3-5

---

## Objectives

Test advanced Home page operations: invite code enrollment, deep copy (keyboard shortcut cloning), drag-and-drop moves (if testable), and notification creation on share/assign events.

## Test Cases

### 6.1 Join Subject by Invite Code
- **Precondition:** Owner creates a subject with invite code (seeded with known code)
- **Action:** Log in as different user → navigate to join/enroll flow → enter invite code → submit
- **Verify:**
  - User is enrolled in subject (appears in their Home)
  - Firestore: user added to subject enrollment data
  - Shortcut document created for the enrolling user
- **Cleanup:** Remove enrollment, delete shortcut, delete subject

### 6.2 Deep Copy Subject (Keyboard Shortcut)
- **Precondition:** Subject exists on Home page
- **Action:** Select subject → press Ctrl+C then Ctrl+V (or app-specific shortcut)
- **Verify:**
  - A copy of the subject appears with "(copia)" or similar suffix
  - Copy is a separate Firestore doc with new ID
  - Copy has same content structure but different `ownerId`/metadata
- **Cleanup:** Delete both original and copy

### 6.3 Deep Copy Subject with Topics
- **Precondition:** Subject with 2+ topics seeded
- **Action:** Deep copy the subject via keyboard shortcut
- **Verify:**
  - Copied subject has its own independent topic documents
  - Topic content matches original but with new document IDs
  - Modifying copy's topics does NOT affect original
- **Cleanup:** Delete both subjects + all associated topics

### 6.4 Drag-and-Drop Subject into Folder
- **Precondition:** Subject + folder at root level
- **Action:** Use Playwright's `dragTo()` API to drag subject onto folder
- **Verify:**
  - Subject moves into folder (disappears from root, appears inside folder)
  - Firestore: subject's `parentId` updated
- **Cleanup:** Delete subject and folder
- **Note:** If DnD is not reliably testable with Playwright, document as known limitation and skip

### 6.5 Drag-and-Drop to Breadcrumb (Move to Parent)
- **Precondition:** Subject nested inside folder
- **Action:** Drag subject onto breadcrumb path element (parent or root)
- **Verify:**
  - Subject moved to target breadcrumb location
  - Firestore updated accordingly
- **Cleanup:** Delete all entities
- **Note:** Same DnD testability caveat as 6.4

### 6.6 Notification Created on Share
- **Precondition:** Owner has subject; editor account exists
- **Action:** Owner shares subject with editor
- **Verify:**
  - New notification document created in `notifications` collection
  - Notification has correct `recipientId`, `type`, `subjectId`
  - Editor sees notification in their notification panel (if testable in UI)
- **Cleanup:** Delete notification + unshare + delete subject

### 6.7 Notification Created on Assignment
- **Precondition:** Teacher has subject; student account exists in same institution
- **Action:** Teacher assigns subject to student (if UI supports direct assignment)
- **Verify:**
  - Assignment notification created
  - Student receives notification
- **Cleanup:** Delete notification + remove assignment + delete subject
- **Note:** May overlap with sharing flow; skip if assignment is same as share

## Validation Gate

- [ ] Invite code enrollment works end-to-end
- [ ] Deep copy creates independent copies (subjects + topics)
- [ ] DnD tested or documented as limitation
- [ ] Notifications correctly created on share events
- [ ] All cleanup executed, no orphaned data
- [ ] Commit and push completed

## Known Limitations

- Playwright DnD support can be unreliable for complex drag interactions
- If DnD tests are flaky, they should be marked with `test.fixme()` or `test.skip()` with documented reason
- Notification panel might require waiting for real-time listener propagation

## Files Created/Modified

- `tests/e2e/home-advanced-operations.spec.js` (new)
