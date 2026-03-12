# SubjectGradesPanel.jsx

## Overview
- **Source file:** `src/pages/Subject/components/SubjectGradesPanel.jsx`
- **Last documented:** 2026-03-12
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
- 2026-03-12: Added assignment pipeline in weighted grading (auto-ingestion from quiz results, assignment weights in final computation, and per-student teacher revision override controls).
- 2026-03-12: Refactored to block-based grading architecture with strict 100% across blocks and internal relative weighting for mandatory tests and deliverable tasks.
- 2026-03-12: Added equal-by-default internal quiz weighting with per-section custom-weight toggles; when custom mode is enabled, new quizzes auto-receive distributed remaining percentage while preserving already configured weights.

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
