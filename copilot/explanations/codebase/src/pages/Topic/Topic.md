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

### 2026-03-12 - Topic Assignments Data Flow

**Change**: Added realtime assignment subscription (`topicAssignments`) in `Topic.jsx` and merged assignments into `enrichedTopic`.

**Reason**: Support the new `Tareas` section with live counts and role-aware visibility in the Topic view.

**Impact**: Topic tabs/content now receive `topic.assignments` alongside existing materials/uploads/quizzes/exams without altering prior behaviors.

### 2026-03-29 - Listener Error Hardening

**Change**: Added explicit Firestore `onSnapshot` error callbacks in `Topic.jsx` for quiz-results and topic-assignments listeners.

**Reason**: Prevent uncaught runtime watch failures from cascading into blank/unstable topic rendering under restricted Firestore permissions.

**Impact**: Topic page now degrades more safely when listener queries are denied while preserving existing data-enrichment flow.

### 2026-03-29 - Teacher Quiz Analytics and Grade Overrides

**Change**: Added role-aware quiz result loading, class analytics aggregation (`quizAnalyticsByQuiz`), and manual teacher score overrides via `topicQuizGradeReviews`.

**Reason**: Enable teacher visibility into class quiz performance (average + per-student) and allow controlled grade adjustments.

**Impact**: Topic quiz cards can now open class-grade drilldowns with detailed student answer review and override grading workflow.

### 2026-03-29 - Teacher Analytics Identity Enrichment

**Change**: Class quiz analytics rows now include student avatar metadata (`photoURL`) sourced from class-members resolution.

**Reason**: Support richer teacher roster UI with recognizable student identities.

**Impact**: Teacher quiz panel can display student photos alongside names and grades.

### 2026-03-29 - Teacher Score Exclusion and Override Write-Through

**Change**: Teacher analytics now excludes teacher/editor-owned quiz results in non-student simulation mode, and override saves update both review docs and canonical quiz result docs.

**Reason**: Prevent teacher self-scores from polluting class metrics and guarantee immediate visible grade updates.

**Impact**: Class averages/rosters reflect only student performance and override actions refresh reliably.

### 2026-03-29 - Permission-Denied Graceful Listener Fallback

**Change**: Updated quiz-results, quiz-reviews, and topic-assignments snapshot error handlers to treat `permission-denied` as a non-fatal empty-state fallback.

**Reason**: Prevent simulation and restricted-role contexts from surfacing noisy fatal logs or unstable transitions when Firestore denies optional data streams.

**Impact**: Topic view now remains stable with clean fallback state under restricted permissions.
