// copilot/explanations/codebase/tests/unit/hooks/useSubjects.test.md

## Changelog
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
