<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/phases/phase-05-subject-cascading.md -->
# Phase 05: Subject Field Cascading Updates

**Status**: `not-started`
**Sub-Branch**: `arch/multi-feature-enhancement-2026-04-19/phase-05-subject-cascading`
**Dependencies**: Phase 03 (unsaved-changes guard), Phase 04 (subject validation)
**Threat Refs**: T-DATA-02

---

## Objective

When modifying subject fields (course, academic year, academic period), propagate changes to related entities and UI state. Ensure the edit overlay uses the centralized unsaved-changes guard.

---

## Tasks

### 5.1 — Map Cascading Dependencies
- [ ] Document which fields trigger which cascading updates:
  | Field Changed | Cascading Effect |
  |--------------|-----------------|
  | `academicYear` | Available classes in "Clases" tab filter to new year's classes |
  | `academicPeriod` | Re-evaluate subject finished/not-finished status |
  | `academicYear` | Re-evaluate subject finished/not-finished status |
  | `course` | Available classes may change (if classes are course-scoped) |

### 5.2 — Implement Class List Filtering
- [ ] When `academicYear` changes in the overlay:
  - [ ] Re-query or re-filter available classes for the "Clases" tab
  - [ ] Show only classes that belong to the new academic year
  - [ ] If currently assigned classes don't belong to new year, show warning
  - [ ] Allow user to reassign classes before saving

### 5.3 — Implement Subject Status Re-evaluation
- [ ] When `academicPeriod` or `academicYear` changes:
  - [ ] Check if the new period/year is in the past → subject is "finished"
  - [ ] Check if the new period/year is current or future → subject is "active"
  - [ ] Update visual indicator (finished/active styling) immediately in the overlay
  - [ ] Persist status change to Firestore on save (not before)

### 5.4 — Batch Write for Atomicity
- [ ] When saving cascading changes:
  - [ ] Use Firestore `writeBatch()` to update subject AND related entities atomically
  - [ ] If batch write fails, show error and allow retry
  - [ ] Do not partially commit changes

### 5.5 — Apply Unsaved-Changes Guard
- [ ] Wrap the subject edit overlay with `GuardedOverlay` (from Phase 03)
- [ ] Ensure changes to any field (including cascading) mark the form as dirty
- [ ] Clicking outside with pending changes triggers confirmation

### 5.6 — Testing
- [ ] Unit test: Year change → class filter function returns correct classes
- [ ] Unit test: Period change → status re-evaluation returns correct status
- [ ] Unit test: Batch write success and failure handling
- [ ] E2E test: Change year → verify classes tab updates → save → verify status

---

## Acceptance Criteria

- [ ] Changing academic year refreshes available classes in "Clases" tab
- [ ] Changing academic period or year updates subject finished/active status
- [ ] Visual indicators update immediately in the overlay after field change
- [ ] All changes saved atomically via batch write
- [ ] Failed batch write shows error and allows retry (no partial state)
- [ ] Unsaved-changes guard active on the subject edit overlay
- [ ] No data corruption from cascading updates

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/utils/subjectCascading.ts` | Cascading logic: class filtering, status evaluation |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Subject/modals/SubjectFormModal.jsx` | Add cascading handlers, batch write, guard integration |
| `src/pages/Home/modals/EditSubjectModal.jsx` | Same cascading logic |

---

## Validation Evidence

_(Fill after implementation)_

| Check | Result |
|-------|--------|
| Year → classes filter | |
| Period → status update | |
| Batch write success | |
| Batch write failure recovery | |
| Guard integration | |
| Unit tests pass | |
| E2E test pass | |
