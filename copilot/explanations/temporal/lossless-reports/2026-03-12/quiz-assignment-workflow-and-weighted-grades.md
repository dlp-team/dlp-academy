# Lossless Change Report - Quiz Assignment Workflow and Weighted Grades

## Requested Scope
- Add 3-dot actions on quiz cards for non-students (edit/delete).
- Keep edit route to quiz editor and add assignment fields (task flag, date window, weight).
- Show assignment indicator on cards.
- Respect assignment availability windows for students.
- Reflect assignment grades in weighted notes with teacher revision controls.

## Preserved Behaviors
- Existing quiz completion and score visualization remains unchanged.
- Existing quiz result persistence (`quiz_results`) remains unchanged.
- Existing custom evaluation item flows (create/update/delete/manual score entry) remain unchanged.
- Subject grading summary logic remains normalized by covered weight.

## Touched Files
- `src/pages/Topic/components/TopicContent.jsx`
- `src/pages/Quizzes/QuizEdit.jsx`
- `src/pages/Quizzes/Quizzes.jsx`
- `src/pages/Subject/components/SubjectGradesPanel.jsx`
- `copilot/explanations/codebase/src/pages/Topic/components/TopicContent.md`
- `copilot/explanations/codebase/src/pages/Quizzes/QuizEdit.md`
- `copilot/explanations/codebase/src/pages/Quizzes/Quizzes.md`
- `copilot/explanations/codebase/src/pages/Subject/components/SubjectGradesPanel.md`

## File-by-File Verification
- `src/pages/Topic/components/TopicContent.jsx`
  - Added contextual 3-dot menu visible only for non-student users.
  - Added edit/delete actions (edit route + delete handler).
  - Added assignment badge and schedule metadata.
  - Added student gating for assignment windows with disabled CTA and lock labels.
- `src/pages/Quizzes/QuizEdit.jsx`
  - Added assignment metadata controls in editor.
  - Persisted normalized fields: `isAssignment`, `assignmentStartAt`, `assignmentDueAt`, `assignmentWeight`.
  - Preserved existing question/option editing behavior.
- `src/pages/Quizzes/Quizzes.jsx`
  - Loaded assignment metadata into runtime quiz data.
  - Added review-screen availability messaging.
  - Disabled start action for students outside assignment window.
- `src/pages/Subject/components/SubjectGradesPanel.jsx`
  - Added assignment quiz ingestion from `quizzes` collection.
  - Added assignment grade extraction from existing `quiz_results` stream.
  - Included assignment weights in final weighted grade computation.
  - Added teacher revision override controls via `subjectAssignmentGradeReviews`.
  - Kept existing custom weighted evaluation workflows.

## Validation Summary
- `get_errors` run on all touched source files.
- Result: no errors found in modified files.

## Assumptions
- Assignment quizzes include `subjectId` and `isAssignment` on quiz documents.
- Assignment scores are derived from existing `quiz_results.score` percentage values and converted to decimal /10.
- Teacher review overrides are stored per `(subjectId, quizId, userId)` in `subjectAssignmentGradeReviews`.

## Incremental Update (Same Day)
- Added save hardening in `QuizEdit.jsx` to reduce save failures:
  - explicit payload normalization,
  - required-field checks,
  - date-range validation,
  - inline error message instead of silent failure.
- Added `countsForGrade` (`Para la nota`) toggle in `QuizEdit.jsx`:
  - assignment weighting input only appears when enabled,
  - `assignmentWeight` forced to `0` when disabled.
- Updated primary CTA in `TopicContent.jsx`:
  - admin and creator-teacher users now get `Editar test` as the main action,
  - students keep start/retry behavior and assignment availability restrictions.

## Incremental Update - Block Grading Split
- Reworked `SubjectGradesPanel.jsx` to split grading by 3 explicit blocks:
  - `Tests obligatorios`
  - `Tareas entregables`
  - `Extras`
- Added strict 100% enforcement for block weights at subject config level (`gradingConfig`).
- Added internal weighting controls for mandatory tests and deliverable tasks (relative weighting inside each block).
- Updated student and manager views to show block-separated decimals and contributions.
