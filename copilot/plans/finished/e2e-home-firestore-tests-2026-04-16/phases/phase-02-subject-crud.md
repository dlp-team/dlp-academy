<!-- copilot/plans/active/e2e-home-firestore-tests-2026-04-16/phases/phase-02-subject-crud.md -->
# Phase 2: Subject CRUD Tests

**Status:** `todo`  
**Depends on:** Phase 1  
**Test file:** `tests/e2e/home-subject-crud.spec.js`  
**Commits target:** 3-5

---

## Objectives

Test every Firestore write/modify/delete operation for subjects triggered from the Home page. Each test must create test data, perform the operation, verify the result (UI + optionally Firestore), and clean up.

## Test Cases

### 2.1 Create Subject
- **Precondition:** Logged in as owner, on Home page
- **Action:** Click "Crear materia" button → fill form (name, course, academic year, period) → submit
- **Verify:** 
  - New subject card appears in subject list
  - Subject document exists in Firestore with correct fields
  - Invite code was generated (non-empty)
- **Cleanup:** Delete created subject via Admin SDK

### 2.2 Update Subject
- **Precondition:** Test subject seeded via Admin SDK
- **Action:** Open subject options menu → Edit → change name/course → save
- **Verify:**
  - Updated values appear in UI
  - Firestore document reflects new values
- **Cleanup:** Delete seeded subject

### 2.3 Soft-Delete Subject (Move to Trash)
- **Precondition:** Test subject seeded via Admin SDK
- **Action:** Open subject options menu → Delete → confirm
- **Verify:**
  - Subject disappears from Home view
  - Firestore document has `status: "trashed"` and `trashedAt` timestamp
- **Cleanup:** Hard-delete from Firestore

### 2.4 Restore Subject from Trash
- **Precondition:** Trashed subject seeded via Admin SDK (status: trashed)
- **Action:** Navigate to Bin view → find subject → click Restore
- **Verify:**
  - Subject reappears on Home page
  - Firestore document has `status: "active"` and no `trashedAt`
- **Cleanup:** Delete restored subject

### 2.5 Mark Subject as Completed
- **Precondition:** Test subject seeded and visible
- **Action:** Open subject options → Mark as completed
- **Verify:**
  - Subject shows completed indicator in UI
  - User's `completedSubjects` array in Firestore contains subject ID
- **Cleanup:** Remove completion marker + delete subject

### 2.6 Join Subject by Invite Code
- **Precondition:** Subject with invite code seeded by owner account
- **Action:** Log in as a different user (editor/viewer) → Enter invite code → Join
- **Verify:**
  - User is enrolled in subject (appears in their Home)
  - Subject's enrollment data updated in Firestore
  - Shortcut created for enrolled user
- **Cleanup:** Remove enrollment, delete shortcut, delete subject

## Validation Gate

- [ ] All 6 test cases pass with `E2E_RUN_MUTATIONS=true`
- [ ] All test cases skip gracefully when env vars are missing
- [ ] No orphaned test data after suite completion (verify via Admin SDK query for `e2eSeed: true`)
- [ ] `npx playwright test tests/e2e/home-subject-crud.spec.js` exits cleanly
- [ ] Commit and push completed

## UI Selectors (to discover during implementation)

- Create subject button
- Subject card / list item
- Subject options menu (edit, delete, complete, share)
- Invite code input field
- Bin/trash view navigation
- Restore button in bin view

## Files Created/Modified

- `tests/e2e/home-subject-crud.spec.js` (new)
