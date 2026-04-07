<!-- copilot/plans/active/original-plan-autopilot-2026-04-07/phases/phase-06-topic-create-actions-restore.md -->
# Phase 06 - Topic Create Actions Restore

## Status
- finished

## Objectives
- Restore create-action controls for quizzes, exams, and study guides on topic page.
- Align restored controls with prior expected behavior from main branch baseline.

## Validation
- get_errors on topic page modules.
- Targeted tests for button visibility conditions and action handlers.
- Manual verification in relevant roles/views.

## Outcome
- Restored explicit create controls for `materials` tab through a compact plus-menu exposing:
	- `Crear guía de estudio`
	- `Crear examen`
- Preserved existing quick-create controls for:
	- `quizzes` tab (test generation)
	- `assignments` tab (assignment create event dispatch)
- Added dedicated logic handlers in `useTopicLogic` for typed content creation:
	- `handleCreateCustomStudyGuide`
	- `handleCreateCustomExam`
- Added deterministic coverage in `tests/unit/pages/topic/TopicTabs.createActions.test.jsx` for visibility and handler dispatch behavior.
