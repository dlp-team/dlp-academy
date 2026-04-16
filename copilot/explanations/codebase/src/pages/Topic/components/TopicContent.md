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
### 2026-04-15: Preview assignments mock section + prefetched deep links
- Added preview-only `assignments` rendering branch that displays task mock cards directly from `topic.assignments`, avoiding Firestore-dependent assignment management in theme preview mode.
- Quiz/exam deep links now pass prefetched payloads (`prefetchedQuiz`, `prefetchedExam`) during preview navigation to keep downstream mock route context deterministic.
- Preview mode hides `Ver revision` action for completed quizzes to avoid routing into review flows that depend on non-mock backend reads.

### 2026-04-02: Active-role student/teacher analytics alignment
- Student/viewer detection in quiz cards and analytics sections now resolves from `getActiveRole(user)` + viewer permissions, avoiding stale behavior when active role is switched.

### 2026-03-30: Student exams cards aligned to StudyGuide gradient style
- Applied the same StudyGuide-inspired full-gradient visual language to student-view generated exam cards in `materiales` (white typography, translucent chips, and glass CTA) for consistent cross-role presentation.

### 2026-03-30: Exams cards aligned to StudyGuide gradient style
- Updated teacher `materials` exams cards to use the same full-gradient visual language as StudyGuide (high-contrast white typography, glass chips, watermark icon, and translucent CTA surface).

### 2026-03-30: Premium visual refresh for teacher exams cards
- Redesigned teacher `materials` exams cards (AI files + generated exams) to align with StudyGuide/FileCard language: gradient accents, watermark icon layer, improved metadata hierarchy, and stronger uppercase CTA styling.

### 2026-03-30: Teacher exams visible without StudyGuide dependency
- Removed the early return in `materials` view that hid the whole section when `mainGuide` was missing.
- Exams cards now render for teachers whenever exam data exists, even if StudyGuide/Fórmulas content is not available yet.

### 2026-03-30: Teacher materials now include AI-generated exams
- In the `materials` tab (teacher view), added AI-generated exam cards sourced from `topic.pdfs` exam/evaluation types below StudyGuide/Fórmulas so generated exam content is visible alongside collection-generated exams.

- 2026-03-29: Polished pending tall CTA aesthetics to match completed actions (premium surface gradient, icon chip treatment, and balanced enterprise visual rhythm).
- 2026-03-29: Refined pending-state tall CTA to icon-only play presentation and added explicit accessible label, keeping block-height parity with completed actions.
- 2026-03-29: Expanded pending-state primary CTA to block height parity with the completed two-action area (retry + review) for consistent card footer balance.
- 2026-03-29: Aligned pending quiz primary CTA height with completed-state actions so start/retry/review controls share consistent vertical size.
- 2026-03-29: Increased completed-state quiz actions size (`Reintentar test` and `Ver revision`) for better touch targets and readability.
- 2026-03-29: Increased visual prominence of the pending-state `Comenzar test` CTA and enabled click-to-start on the full quiz flashcard when the quiz is not completed and is currently available.
- 2026-03-29: Enhanced internal quiz-card gradient styling (dual blur glows, richer icon chip depth, glassy analytics panel, and refined action button surfaces) for stronger premium visual parity with file cards.
- 2026-03-29: Unified quiz-card palette with uploaded file-card color system (subject gradient now drives icon chip, level/assignment badges, analytics CTA, and card surface highlight).
- 2026-03-29: Restored teacher primary CTA behavior so users with quiz-edit permission consistently see `Editar test` instead of `Comenzar test`.
- 2026-03-29: Quiz cards now use adaptive minimum heights by state (teacher-management, completed, pending) to keep layout balanced and readable when retry/review actions appear.
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
