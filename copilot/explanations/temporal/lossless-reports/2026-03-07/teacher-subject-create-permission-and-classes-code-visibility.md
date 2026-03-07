# Lossless Change Report - 2026-03-07

## Requested Scope
- Fix teacher `permission-denied` when creating a subject.
- Add a test that exercises subject creation viability.
- Ensure subject invite code is visible in the subject 3-dots flow under class management.

## Root Cause
- `useSubjects.addSubject` reserves invite codes with `runTransaction(... transaction.get(inviteCodeRef) ...)`.
- For a not-yet-existing invite-code document, Firestore evaluates read permissions on `subjectInviteCodes/{inviteCodeKey}`.
- Previous read rule relied on `resource.data.institutionId`, which is unavailable for missing docs, causing `permission-denied` on existence checks.

## Changes Applied
- `firestore.rules`
  - Added helper `inviteCodeKeyMatchesCurrentInstitution(inviteCodeKey)`.
  - Extended `subjectInviteCodes` read rule to allow same-institution key-prefix reads even when doc does not exist.
- `tests/rules/firestore.rules.test.js`
  - Added test allowing same-institution missing-doc existence check.
  - Added test denying cross-institution missing-doc existence check.
- `src/pages/Subject/modals/SubjectFormModal.jsx`
  - Added invite-code display and copy button in `Clases` tab.

## Preservation Checks
- Existing deny behavior for cross-institution and unauthorized users remains intact.
- Existing subject invite code create/update/delete restrictions remain unchanged.
- Subject create payload requirements (`course`, `inviteCode`) remain enforced.

## Validation Summary
- `get_errors` on touched files: no errors.
- `npm run test -- tests/unit/hooks/useSubjects.test.js`: passed.
- `firebase emulators:exec --only firestore "npm run test -- tests/rules/firestore.rules.test.js"`: passed (10/10).
- `firebase deploy --only firestore:rules`: successful.
