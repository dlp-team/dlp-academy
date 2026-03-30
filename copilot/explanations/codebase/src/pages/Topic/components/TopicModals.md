<!-- copilot/explanations/codebase/src/pages/Topic/components/TopicModals.md -->
# TopicModals.jsx

## Overview
- **Source file:** `src/pages/Topic/components/TopicModals.jsx`
- **Last documented:** 2026-02-24
- **Role:** Reusable UI component consumed by the parent page/module.

## Responsibilities
- Renders topic-level transient UI surfaces (toast, creation modals, file viewer modal).
- Centralizes modal orchestration so `Topic.jsx` stays focused on page composition.
- Hosts destructive-action confirmation UX through `TopicConfirmDeleteModal`.

## Exports
- `default TopicModals`

## Main Dependencies
- `react`
- `lucide-react`
- `../../../components/ui/AppToast`
- `../../../components/modals/QuizModal`
- `../../../components/modals/CreateContentModal`
- `./TopicConfirmDeleteModal`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
### 2026-03-30
- Added `TopicConfirmDeleteModal` integration so Topic file/quiz/topic destructive actions are confirmed in-page instead of using browser dialogs.
