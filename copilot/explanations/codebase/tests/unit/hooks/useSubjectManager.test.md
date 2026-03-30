<!-- copilot/explanations/codebase/tests/unit/hooks/useSubjectManager.test.md -->
# useSubjectManager.test.js

## Overview
- **Source file:** `tests/unit/hooks/useSubjectManager.test.js`
- **Last documented:** 2026-03-30
- **Role:** Unit coverage for subject manager hook behavior.

## Coverage
- Missing-subject redirect to Home.
- Topics-listener failure fallback releases loading and clears topics state.
- Topic creation payload and `topicCount` increment behavior.
- Topic reorder persistence via Firestore batch updates.
- Topic deletion integration with shared cascade cleanup utility.

## Changelog
### 2026-03-30
- Added assertion that `deleteTopic` invokes shared `cascadeDeleteTopicResources` before deleting topic doc.
- Added regression coverage for topics listener error fallback behavior (loading release + empty topics state).
