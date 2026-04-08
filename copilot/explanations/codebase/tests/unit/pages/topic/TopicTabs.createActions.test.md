<!-- copilot/explanations/codebase/tests/unit/pages/topic/TopicTabs.createActions.test.md -->
# TopicTabs.createActions.test.jsx

## Overview
- **Source file:** `tests/unit/pages/topic/TopicTabs.createActions.test.jsx`
- **Last documented:** 2026-04-07
- **Role:** Unit coverage for Topic tab-level create action visibility and handler routing.

## Coverage
- Materials tab shows explicit create options for study guide and exam when edit permissions exist.
- Study-guide action dispatches `handleCreateCustomStudyGuide`.
- Exam action dispatches `handleCreateCustomExam`.
- Quizzes tab keeps existing quick-create dispatch via `handleCreateCustomQuiz`.
- Create controls are hidden when edit permissions are not granted.

## Changelog
### 2026-04-08
- Added regression coverage for explicit teacher-role precedence when fallback role resolver reports `student`, ensuring create controls remain visible for editable teacher sessions.
- Added complementary mixed-role regression coverage where normalized profile role is `student` but active role is `teacher`, preserving create-control visibility.

### 2026-04-07
- Added deterministic regression coverage for Phase 06 Topic create-action restoration.
