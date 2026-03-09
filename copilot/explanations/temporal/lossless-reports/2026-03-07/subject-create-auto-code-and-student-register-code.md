# Lossless Change Report - 2026-03-07

## Requested Scope
- Remove mandatory `enrolledStudentUids` requirement for subject writes.
- Keep subject invite code platform-generated (teacher should not manually define it at creation).
- Allow student registration through institutional student code validation, similar to teacher flow.

## Preserved Behaviors
- Teacher/admin registration still supports direct invite lookup/deletion behavior.
- Teacher/admin verification-code-required behavior remains enforced.
- Subject creation still requires `course` and `inviteCode` fields in rules.
- Existing teacher institutional code callable flow remains unchanged.

## Files Touched
- `firestore.rules`
- `src/hooks/useSubjects.js`
- `src/pages/Auth/hooks/useRegister.js`
- `src/pages/Auth/Register.jsx`
- `tests/unit/hooks/useRegister.test.js`
- `tests/unit/hooks/useSubjects.test.js`
- `tests/rules/firestore.rules.test.js`
- `copilot/explanations/codebase/src/pages/Auth/hooks/useRegister.md`
- `copilot/explanations/codebase/src/hooks/useSubjects.md`
- `copilot/explanations/codebase/src/pages/Auth/Register.md`

## Per-File Verification
- `firestore.rules`
  - Removed `enrolledStudentUids` from mandatory schema checks in both subject `create` and `update`.
  - Rules compiled and deployed successfully.
- `src/hooks/useSubjects.js`
  - `addSubject` now always starts from `generateSubjectInviteCode()` instead of payload-provided code.
- `src/pages/Auth/hooks/useRegister.js`
  - Added student to verification-code flow.
  - Student code validation now calls `validateInstitutionalAccessCode` with `userType: 'student'` when a student code is provided.
- `src/pages/Auth/Register.jsx`
  - Code input shown for student/teacher/admin.
  - Student code input is optional and has student-specific helper text.
- `tests/unit/hooks/useRegister.test.js`
  - Added passing test for student code callable validation path.
- `tests/unit/hooks/useSubjects.test.js`
  - Updated expectations for invite-code generation call counts.
- `tests/rules/firestore.rules.test.js`
  - Added test ensuring subject creation succeeds without `enrolledStudentUids`.

## Validation Summary
- `get_errors` on all touched source/test files: no errors.
- `npm run test -- tests/unit/hooks/useRegister.test.js tests/unit/hooks/useSubjects.test.js`: passed.
- `firebase deploy --only firestore:rules`: successful.
- Rules emulator suite (`tests/rules/firestore.rules.test.js`) was not executed in this run due missing emulator host/port in current shell context.
