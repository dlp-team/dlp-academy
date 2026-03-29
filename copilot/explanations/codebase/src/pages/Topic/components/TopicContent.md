# TopicContent.jsx

## Overview
- **Source file:** `src/pages/Topic/components/TopicContent.jsx`
- **Last documented:** 2026-02-24
- **Role:** Reusable UI component consumed by the parent page/module.

## Responsibilities
- Handles user events and triggers updates/actions.

## Exports
- `default TopicContent`

## Main Dependencies
- `react`
- `lucide-react`
- `../FileCard/FileCard`
- `../../../components/modules/QuizCard/QuizCard`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
- 2026-03-29: Tuned quiz-card proportions for closer parity with uploaded file cards (student view fixed card-height profile; teacher view keeps expanded min-height for analytics controls).
- 2026-03-29: Redesigned quiz cards to align with uploaded-file card visual language (clean bordered shell, watermark icon, compact badge/meta blocks, and uppercase action buttons) while preserving all quiz actions and teacher analytics controls.
- 2026-03-29: Added teacher-only consolidated export (`Exportar todos los tests`) generating an Excel-compatible student-vs-test score matrix.
- 2026-03-29: Added teacher quiz class analytics entry points (`Ver clase`) with average/participants summary and modal drilldown integration for per-student answers + grade overrides.
- 2026-03-29: `Mis Archivos` cards now display a file-type badge and are wired to category updates through the three-dot menu actions.
- 2026-03-29: Student Resúmenes now prioritize the original uploaded source PDF (manual `pdf`) ahead of StudyGuide/Fórmulas and the remaining summary cards.
- 2026-03-29: Resúmenes layout now uses a unified adaptive grid so StudyGuide and Fórmulas share the same line with file cards; StudyGuide span dynamically shrinks with card count down to one-card minimum before wrapping.
- 2026-03-29: Student `materiales` Resúmenes/Exámenes document cards were migrated to the shared `FileCard` component to match teacher upload card visual quality while preserving student-safe open actions.
- 2026-03-29: Student `materiales` rendering was stabilized by removing synthetic demo placeholders and restoring real-data-first fallback selection for summary/study-guide cards.
- 2026-03-12: Quiz cards now support non-student contextual actions (edit/delete), assignment tagging with icon/date metadata, and student-side availability gating for assignment windows (not yet open / expired).
- 2026-03-12: Added `assignments` tab rendering through `TopicAssignmentsSection`, separating task management and delivery workflows from quiz/materials UI.
- 2026-03-12: Primary quiz CTA now switches to `Editar test` for admin and creator-teacher users, while students/other viewers keep start/retry behavior with assignment window gating.
