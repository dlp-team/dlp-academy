# SubjectGradesPanel.jsx

## Overview
- **Source file:** `src/pages/Subject/components/SubjectGradesPanel.jsx`
- **Last documented:** 2026-03-30
- **Role:** Subject-level grading panel with student and manager views.

## Responsibilities
- Aggregates decimal quiz grades from topic-level `quiz_results`.
- Computes weighted final grade from 3 explicit blocks: mandatory tests, deliverable tasks, and extras.
- Manages custom weighted evaluation items and per-student manual grades.
- Integrates assignment quizzes (`isAssignment`) with internal weighting.
- Supports teacher revision overrides for assignment grades.
- Enforces strict block-level 100% configuration for the grading model.

## Exports
- `default SubjectGradesPanel`

## Main Dependencies
- `react`
- `lucide-react`
- `firebase/firestore`
- `../../../firebase/config`

## Changelog
- 2026-04-02: Teacher/student manage-mode detection now uses `getActiveRole(user)` to keep grading controls aligned with switched role context.
- 2026-03-30: Added stream-specific realtime listener error tracking with inline panel banner feedback for snapshot failures in quizzes, exams, reviews, evaluation items/grades, and topic quiz-result streams.
- 2026-03-30: Listener success callbacks now clear stale stream feedback while preserving existing fallback state resets (empty arrays/maps) on error paths.
- 2026-03-30: Replaced `window.confirm(...)` in extra-activity deletion with in-page modal confirmation (`evaluationDeleteConfirm` + `confirmDeleteEvaluationItem`), preserving related grade cleanup through the existing Firestore batch path.
- 2026-03-30: Added explicit request/close/confirm delete handlers and loading-safe modal actions (`isDeletingEvaluation`) to prevent duplicate destructive submissions.
- 2026-03-30: Removed pre-existing unused mandatory-weight helper declarations that had no active consumers, keeping touched-file lint checks error-free without behavior changes.
- 2026-03-12: Added assignment pipeline in weighted grading (auto-ingestion from quiz results, assignment weights in final computation, and per-student teacher revision override controls).
- 2026-03-12: Refactored to block-based grading architecture with strict 100% across blocks and internal relative weighting for mandatory tests and deliverable tasks.
- 2026-03-12: Added equal-by-default internal quiz weighting with per-section custom-weight toggles; when custom mode is enabled, new quizzes auto-receive distributed remaining percentage while preserving already configured weights.

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
