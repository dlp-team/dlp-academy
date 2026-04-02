// copilot/explanations/codebase/tests/rules/firestore.rules.test.md

## Changelog
### 2026-04-02: Emulator gate closure validation
- Revalidated this suite via `npm run test:rules` with active Firestore/Storage emulators after explicit emulator config activation in `firebase.json`.
- Phase 02 rules validation gate is now closed with deterministic emulator-backed execution.

### 2026-04-02: Invite-code transaction preflight coverage
- Added rules tests for `subjectInviteCodes` missing-doc preflight access:
  - allow same-institution teacher get on missing invite-code doc key,
  - deny cross-institution teacher get on missing invite-code doc key.
- Added same-batch create regression test ensuring teacher can reserve invite code and create the corresponding subject in one batched write.

### 2026-04-01: Phase 03 residual coverage closure
- Added subject class assignment integrity tests:
  - allow teacher create/update when `classId` matches subject `institutionId`,
  - deny teacher create/update when `classId` belongs to a different institution.
- Added constrained student invite-join rules tests:
  - allow self-join payload updates,
  - deny payloads that attempt to add extra users.

### 2026-04-01: Teacher autonomous subject-creation policy enforcement coverage
- Added rules tests validating institution-configurable teacher subject creation:
  - deny teacher create when `accessPolicies.teachers.allowTeacherAutonomousSubjectCreation` is `false`,
  - allow teacher create when policy is explicitly `true`.

### 2026-03-30: Teacher recognition updates coverage
- Added dedicated user-rule tests validating teacher-scoped recognition updates:
  - allow teacher updating `badges`, `badgesByCourse`, `behaviorScore`, `updatedAt` for same-institution student,
  - deny teacher updates for non-recognition fields,
  - deny teacher recognition writes to student profiles in other institutions.

### 2026-03-09: Phase 05 rules expansion
- Reworked rules integration suite to cover:
  - `institution_invites` create/read/list/update/delete boundary behaviors,
  - non-admin write enforcement for `folders`, `topics`, `documents` (resources), and `quizzes`,
  - denial cases for missing or mismatched `institutionId` on non-admin writes.

## Overview
This suite validates Firestore security rules behavior under emulator execution using deterministic seeded users and documents.

## Notes
- Uses `firebase emulators:exec` for rules-test fidelity.
- Includes cross-role fixtures: global admin, institution admin, teacher, and student.
