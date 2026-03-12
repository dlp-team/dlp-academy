<!-- copilot/explanations/temporal/lossless-reports/2026-03-12/subject-form-course-firestore-source.md -->
# Lossless Change Report — Subject Form Course Source

## 1) Requested scope
- Make subject creation use real courses created by `institutionadmin` so those courses appear as selectable options in the subject form `course` field.

## 2) Out-of-scope behavior explicitly preserved
- Sharing tab logic and permissions (`viewer`/`editor`, owner protections, confirmations).
- Classes tab behavior and class assignment request flow.
- Subject appearance, tags, and style selection behavior.
- Existing persisted `course` string format in subject documents (no schema migration introduced).

## 3) Touched files
- `src/pages/Subject/modals/SubjectFormModal.jsx`
- `src/pages/Subject/modals/subject-form/BasicInfoFields.jsx`
- `copilot/explanations/codebase/src/pages/Subject/modals/SubjectFormModal.md`
- `copilot/explanations/codebase/src/pages/Subject/modals/subject-form/BasicInfoFields.md`

## 4) Per-file verification details

### `src/pages/Subject/modals/SubjectFormModal.jsx`
- Added Firestore-backed course loading state (`availableCourses`, `coursesLoading`).
- Added course query effect using `courses` collection filtered by `institutionId`.
- Removed static `EDUCATION_LEVELS` dependency and auto-generated course effect.
- Updated required validation so `course` is required directly (without forcing `level`/`grade`).
- Updated invalid-field focus target to the course selector ref.
- Verified no changes to sharing/classes tabs and related handlers.

### `src/pages/Subject/modals/subject-form/BasicInfoFields.jsx`
- Replaced dual `level`/`grade` controls with single `course` select.
- Wired select options to `availableCourses` prop and loading/empty states.
- Preserved inline required-field error rendering (`validationErrors.course`).
- Verified name field behavior and error-clearing behavior remain unchanged.

### `copilot/explanations/codebase/src/pages/Subject/modals/SubjectFormModal.md`
- Appended dated changelog entry documenting Firestore-backed course loading and validation adjustment.

### `copilot/explanations/codebase/src/pages/Subject/modals/subject-form/BasicInfoFields.md`
- Appended dated changelog entry documenting selector migration to Firestore data.

## 5) Risks found + checks
- **Risk:** Legacy subjects relying on `level`/`grade` could lose displayed course text.
  - **Check:** Added fallback course derivation from legacy `level` + `grade` when `course` is absent.
- **Risk:** Validation regression due to selector model change.
  - **Check:** Updated validation to require `course` directly and verified diagnostics clean.
- **Risk:** Regressions outside requested scope.
  - **Check:** Full unit suite run to confirm no unrelated regressions.

## 6) Validation summary
- `get_errors` on touched source files: **No errors found**.
- `npm run test`: **Passed**.
  - Test files: `42 passed`
  - Tests: `271 passed`
