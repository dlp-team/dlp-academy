<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/phases/phase-04-subject-uniqueness.md -->
# Phase 04: Subject Uniqueness Constraint

**Status**: `not-started`
**Sub-Branch**: `arch/multi-feature-enhancement-2026-04-19/phase-04-subject-uniqueness`
**Dependencies**: Phase 03 (unsaved-changes guard for overlay integration)
**Threat Refs**: T-DATA-03

---

## Objective

Prevent creation of subjects with identical (name, course, academic year, associated classes) tuple. Show user-friendly inline error messages in Spanish.

---

## Tasks

### 4.1 — Create Subject Validation Utility
- [ ] File: `src/utils/subjectValidation.ts`
- [ ] Function: `checkSubjectUniqueness(params: SubjectUniquenessParams): Promise<boolean>`
  ```typescript
  interface SubjectUniquenessParams {
    name: string;
    course: string;
    academicYear: string;
    classes: string[];  // class IDs
    institutionId: string;
    excludeSubjectId?: string;  // for edit mode (exclude self)
  }
  ```
- [ ] Query Firestore for matching subjects within the same institution
- [ ] Return `true` if unique, `false` if duplicate exists
- [ ] Handle edge cases: empty strings, null values, case-insensitive comparison

### 4.2 — Integrate Validation in Subject Creation
- [ ] In `SubjectFormModal.jsx` (or `SubjectModal.jsx`):
  - [ ] Call `checkSubjectUniqueness` before save
  - [ ] If duplicate detected, show inline error: "Ya existe una asignatura con este nombre, curso, año académico y clases"
  - [ ] Block form submission until conflict resolved
  - [ ] Error message displayed near the relevant field (not browser alert)

### 4.3 — Integrate Validation in Subject Edit
- [ ] In `EditSubjectModal.jsx` / `SubjectFormModal.jsx` edit mode:
  - [ ] Call `checkSubjectUniqueness` with `excludeSubjectId` set to current subject
  - [ ] Same inline error handling as creation
  - [ ] Validate on field change (debounced) for real-time feedback

### 4.4 — Testing
- [ ] Unit test: `checkSubjectUniqueness` — returns false for duplicate
- [ ] Unit test: `checkSubjectUniqueness` — returns true for unique
- [ ] Unit test: Edge cases (empty name, null course, case insensitive)
- [ ] Unit test: Edit mode excludes self from duplicate check
- [ ] E2E test: Create subject → attempt duplicate → error shown → modify field → creation succeeds

---

## Acceptance Criteria

- [ ] Cannot create two subjects with identical (name, course, year, classes) within same institution
- [ ] Clear inline error message in Spanish when duplicate detected
- [ ] Edit mode correctly excludes current subject from check
- [ ] Validation is debounced (not on every keystroke — on blur or with 300ms debounce)
- [ ] Cross-institution subjects with same tuple ARE allowed (different institutions)
- [ ] Existing duplicate subjects (if any) are not retroactively broken

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/utils/subjectValidation.ts` | Uniqueness check utility |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Subject/modals/SubjectFormModal.jsx` | Add uniqueness validation before save |
| `src/pages/Home/modals/SubjectModal.jsx` | Add uniqueness validation |
| `src/pages/Home/modals/EditSubjectModal.jsx` | Add uniqueness validation (edit mode) |

---

## Validation Evidence

_(Fill after implementation)_

| Check | Result |
|-------|--------|
| Unit tests pass | |
| E2E duplicate blocked | |
| E2E unique allowed | |
| Inline error visible | |
| Cross-institution ok | |
