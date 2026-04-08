// copilot/explanations/codebase/tests/unit/hooks/useSubjects.test.md

## Changelog
### 2026-04-08: Share and assignment notification coverage
- Added notification-focused unit coverage for `useSubjects`:
  - verifies `subject_shared` notification upsert on new direct share,
  - verifies class-assignment and direct-enrollment recipient notification fan-out,
  - verifies no assignment notification writes when recipient sets are unchanged.

### 2026-04-01: Invite enrollment assertion and access-vector coverage
- Expanded invite join test to assert student enrollment payload includes:
  - `sharedWithUids` self-addition,
  - `enrolledStudentUids` self-addition,
  - `isShared` flag set.
- Added student access-vector subscription coverage to ensure `useSubjects` registers:
  - owner vector (`ownerId`),
  - shared vector (`sharedWithUids`),
  - class vector (`classId` equality/in-list),
  - invite-enrollment vector (`enrolledStudentUids`).

### 2026-04-01: Subject completion tracking test coverage
- Added unit coverage for new completion-state behavior in `useSubjects`:
  - normalized `completedSubjectIds` derivation from profile payload,
  - `setSubjectCompletion(..., true)` writes via `arrayUnion`,
  - `setSubjectCompletion(..., false)` writes via `arrayRemove`.

### 2026-04-01: Teacher autonomous subject-creation policy coverage
- Added `useSubjects` coverage for institution policy gating on teacher subject creation:
  - reject create when `allowTeacherAutonomousSubjectCreation` is `false`,
  - allow create when policy is `true`.
- Stabilized teacher deletion-policy tests to use ref-aware `getDoc` mocking due additional policy preload reads.

### 2026-03-30: Subject Cascade Coverage Expanded to Exams
- Updated permanent-delete cascade assertions to include exam artifact collections:
  - `exams`
  - `examns`
- Confirms owner deletion path removes topic-linked exam docs before topic/subject removal.

### 2026-03-09: Phase 02 deletion-cascade edge additions
- Added deletion coverage for boundary fan-out scenarios:
  - deleting a subject with no children,
  - deleting a subject with maximum nested children (topics/resources/quizzes/documents).
- Preserves existing resilience assertions for partial-failure handling and permission-safe behavior.

## Overview
This suite validates `useSubjects` for invite-code transactions, sharing enrollment, and subject-level cascade deletion correctness.

## Notes
- New tests target opposite extremes (empty and maximal trees) to harden cascade assumptions.
- Assertions keep Firestore interaction intent explicit for each deletion stage.
