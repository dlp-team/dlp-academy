<!-- copilot/explanations/temporal/lossless-reports/2026-03-06/subject-access-invite-test-gap-closure.md -->
# Lossless Change Report - Subject Access and Invite Test Gap Closure

## Requested Scope
- Create all missing tests for the recent subject access and invite-code hardening work to reduce regression risk.

## Behaviors Explicitly Preserved
- No production source logic was modified.
- Existing subject creation, invite-code reservation, and access-control behavior remains unchanged.
- Existing unit test suites continue to run without test deletion or test rewrites.

## Touched Files
- `tests/unit/hooks/useSubjects.test.js`
- `tests/unit/utils/subjectAccessUtils.test.js`

## File-by-File Verification
### `tests/unit/hooks/useSubjects.test.js`
- Added transactional coverage for `addSubject`:
  - Collision retry path succeeds after re-generated code.
  - Collision exhaustion path fails after 10 attempts with deterministic error.
  - Non-collision transaction errors (permission-denied) stop retries and bubble up.
- Verified invite reservation + subject write payload assertions, including normalized enrollments.

### `tests/unit/utils/subjectAccessUtils.test.js`
- Added normalization coverage:
  - Course trimming and required validation.
  - `classId`/`classIds` dedupe and enrolled UID normalization.
- Added access-control coverage:
  - Legacy-subject compatibility without class/enrollment gates.
  - Cross-institution deny for non-admin and admin bypass behavior.
  - Teacher class assignment access.
  - Student access by enrolled UID and by class roster.
  - Shared-by-email access and null-user deny behavior.

## Validation Summary
- Focused tests:
  - `npm run test:unit -- tests/unit/hooks/useSubjects.test.js tests/unit/utils/subjectAccessUtils.test.js`
  - Result: passed.
- Full unit suite:
  - `npm run test`
  - Result: `19/19` test files passed, `88/88` tests passed.
- Diagnostics:
  - `get_errors` on touched files returned no errors.

## Remaining Risk / Non-Implemented Coverage
- A dedicated join-by-subject-invite runtime flow is not present in current source, so no executable test could be added for that flow yet.
- Firestore rules negative/allow matrix tests are not currently wired to a rules emulator harness in this repository test setup.
