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

## Changelog
### 2026-03-30
- Expanded deletion cascade assertions to include `exams` and `examns` cleanup before topic deletion.
- Added focused assertions that verify toast feedback replaces alert behavior in Topic failure/info branches.
- Stabilized FileReader categorization mock path for deterministic async completion in upload-categorization tests.
- Added regression assertions for modal-confirmed destructive actions (topic/file/quiz) and verified read-only users cannot open delete confirmation flow.
