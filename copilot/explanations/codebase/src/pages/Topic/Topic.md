<!-- copilot/explanations/codebase/src/pages/Topic/Topic.md -->
# Topic.tsx

## Overview
- **Source file:** `src/pages/Topic/Topic.tsx`
- **Last documented:** 2026-03-30
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

### 2026-04-15 - Preview Mock Data Streams for Quizzes and Tasks

**Change**: Added preview-mode data branches in `Topic.tsx` so quiz results, quiz review overrides, and topic assignments are hydrated from `previewMockData` instead of Firestore listeners when `user.__previewMockData` is enabled.

**Reason**: Enable complete topic-tab mockups (quizzes + tareas) in theme preview without realtime permission noise or empty states.

**Impact**: Preview role sessions now render populated quiz/task states deterministically while production data flow remains unchanged.

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

### 2026-03-30 - Realtime Listener Feedback Banner

**Change**: Added stream-specific realtime error feedback state in `Topic.jsx` and rendered an inline page banner when non-fatal listener failures occur.

**Reason**: Prevent silent degradation when optional realtime streams fail, while keeping page rendering stable.

**Impact**: Topic page now surfaces explicit inline feedback for realtime sync issues (e.g., assignments stream failures) without blocking the rest of the topic workflow.

### 2026-04-02 - Active-Role Student View Resolution

**Change**: Topic-level student/preview gating now resolves from `getActiveRole(user)` instead of raw `user.role`.

**Impact**: Assignment visibility and preview-mode behavior stay consistent with switched role context in dual-role sessions.

### 2026-04-08 - Explicit Role Priority for Topic Student Gating

**Change**: Topic student-view decisions now prioritize explicit `user.role` when present before fallback role resolution.

**Reason**: Recover create-action visibility regressions where fallback role ordering could incorrectly classify teacher sessions as student view.

**Impact**: Teacher Topic sessions retain baseline create controls while preview-as-student behavior remains read-only.

### 2026-04-08 - Mixed-Role Student Gating Hardening

**Change**: Topic student-view decisions now require both normalized profile role and active role to resolve as `student`.

**Reason**: Prevent false student-mode locking in mixed-role sessions and keep create controls visible when teacher context is active.

**Impact**: Create controls and assignment visibility now align with active teacher context while preserving explicit preview-as-student read-only behavior.

### 2026-04-08 - Bin-Origin Read-Only Topic Guard

**Change**: Topic page now parses URL read-only mode (`?mode=readonly`) and applies a hard non-mutating permission overlay.

**Reason**: Phase 03 requires `Ver contenido` from bin to route into content inspection without mutation capability.

**Impact**: Topic create/edit/delete actions and mutating modals are suppressed in bin-origin read-only mode while preserving content visibility and realtime feedback paths.
