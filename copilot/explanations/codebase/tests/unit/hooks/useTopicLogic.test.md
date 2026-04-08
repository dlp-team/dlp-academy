<!-- copilot/explanations/codebase/tests/unit/hooks/useTopicLogic.test.md -->
# useTopicLogic.test.js

## Overview
- **Source file:** `tests/unit/hooks/useTopicLogic.test.js`
- **Last documented:** 2026-03-30
- **Role:** Unit coverage for topic hook permissions, destructive actions, and error handling.

## Coverage
- Role-based permission outputs (student vs teacher).
- Deletion authorization guard in read-only contexts.
- Topic deletion cascade behavior with best-effort cleanup.
- Failure tolerance for query and delete edge cases.
- In-page confirmation flow for file/quiz/topic deletions before executing destructive writes.
- Rename and AI-generation error feedback behavior.
- Topic toast feedback branches for rename failure, empty-file view attempts, and file-categorization failure.
- Topic snapshot listener toast feedback for non-permission failures in topic quizzes stream.
- Topic listener lifecycle regression coverage for child listener teardown before re-subscription on topic snapshot re-emits.

## Changelog
### 2026-04-08
- Added regression coverage that preserves teacher edit permissions when fallback role resolution returns `student` but explicit `user.role` is `teacher`.
- Added regression coverage for legacy topic docs without `ownerId`, verifying topic permissions inherit subject owner metadata before `canEdit` checks.

### 2026-04-02
- Updated `permissionUtils` mocked surface to include `getActiveRole(...)` after Phase 07 Slice 03 topic-hook role-context migration.
- Preserved existing permission and destructive-flow assertions while removing missing-export failures.

### 2026-03-31
- Added regression test that verifies first-generation `documents`/`resumen`/`quizzes` listener unsubscribers are called before second-generation listeners are attached after a topic snapshot re-emit.

### 2026-03-30
- Expanded deletion cascade assertions to include `exams` and `examns` cleanup before topic deletion.
- Added focused assertions that verify toast feedback replaces alert behavior in Topic failure/info branches.
- Stabilized FileReader categorization mock path for deterministic async completion in upload-categorization tests.
- Added regression assertions for modal-confirmed destructive actions (topic/file/quiz) and verified read-only users cannot open delete confirmation flow.
- Added regression assertion that quizzes snapshot listener failures surface toast feedback (`No se pudieron sincronizar los tests del tema.`).
