# Topic.jsx

## Overview
- **Source file:** `src/pages/Topic/Topic.jsx`
- **Last documented:** 2026-02-24
- **Role:** Page-level or feature-level module that orchestrates UI and logic.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.

## Exports
- `default Topic`

## Main Dependencies
- `react`
- `lucide-react`
- `../../components/layout/Header`
- `./hooks/useTopicLogic`
- `../../firebase/config`
- `./components/TopicHeader`
- `./components/TopicTabs`
- `./components/TopicContent`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

---

## Changelog

### 2026-03-08 - Exam Card Component Extraction

**Change**: Refactored inline exam card rendering into dedicated ExamCard component.

**Files Modified**:
- Created `src/pages/Topic/ExamCard/ExamCard.jsx`
- Modified `src/pages/Topic/components/TopicContent.jsx`

**Reason**: Improve code organization and maintainability by following existing pattern (FileCard, QuizCard). Reduce TopicContent.jsx complexity.

**Impact**: Zero functional changes, pure refactoring. Exam cards render identically to before. 48% reduction in exam section code complexity (35 lines → 18 lines).

**Related Documentation**:
- Lossless Report: `copilot/explanations/temporal/lossless-reports/2026-03-08/exam-card-refactor.md`
- Plan: `copilot/plans/todo/exam-card-refactor/`
