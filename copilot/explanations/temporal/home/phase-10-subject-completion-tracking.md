<!-- copilot/explanations/temporal/home/phase-10-subject-completion-tracking.md -->

# Phase 10 Execution Notes: Subject Completion Tracking

## Before
- Home rendered all visible subjects in active views (`Manual`, `Uso`, `Cursos`) with no persisted completion split.
- No user-level hook API existed to mark subject completion directly from Home actions.
- Subject action menus had no completion transition controls.

## After
- Added user-level completion API in `useSubjects`:
  - `completedSubjectIds`
  - `setSubjectCompletion(subjectId, completed)`
- Added Home `Historial` mode and completion-aware filtering in `useHomeState`.
- Active Home subject groupings now exclude completed subjects.
- Subject action menus in both grid and list layouts now include:
  - `Marcar como completada`
  - `Marcar como activa`

## Key Wiring
- `useHomeLogic` now forwards completion IDs to `useHomeState`.
- `HomeMainContent` forwards completion state and updater into `HomeContent`.
- `HomeContent` resolves completion IDs for both source subjects and shortcuts.

## Validation Snapshot
- Focused hook tests passed for:
  - completion ID normalization and profile updates,
  - active/history filtering behavior.
- Existing Home shell tests passed after mode additions.
