// copilot/explanations/codebase/tests/unit/hooks/useSubjects.test.md

## Changelog
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
