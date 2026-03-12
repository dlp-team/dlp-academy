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
- 2026-03-12: Quiz cards now support non-student contextual actions (edit/delete), assignment tagging with icon/date metadata, and student-side availability gating for assignment windows (not yet open / expired).
- 2026-03-12: Added `assignments` tab rendering through `TopicAssignmentsSection`, separating task management and delivery workflows from quiz/materials UI.
- 2026-03-12: Primary quiz CTA now switches to `Editar test` for admin and creator-teacher users, while students/other viewers keep start/retry behavior with assignment window gating.
