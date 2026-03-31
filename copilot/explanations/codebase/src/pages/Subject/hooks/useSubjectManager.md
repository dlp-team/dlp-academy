<!-- copilot/explanations/codebase/src/pages/Subject/hooks/useSubjectManager.md -->
# useSubjectManager.js

## Overview
- **Source file:** `src/pages/Subject/hooks/useSubjectManager.js`
- **Last documented:** 2026-03-30
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `const useSubjectManager`

## Main Dependencies
- `react`
- `react-router-dom`
- `../../../firebase/config`
- `../../../utils/permissionUtils`
- `../../../utils/topicDeletionUtils`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.

## Changelog
### 2026-03-31
- Resumen auto-detect listener now chunks `topicId` `in` queries into deterministic groups of 10 (`MAX_IN_QUERY_VALUES`) to avoid Firestore in-query overflow when many topics are in `generating` state.
- Hook now manages one snapshot listener per chunk and tears all listeners down in effect cleanup while preserving existing auto-completion behavior.

### 2026-03-30
- Topic deletion in subject view now uses shared `cascadeDeleteTopicResources` before deleting the topic doc and decrementing `topicCount`.
- Cascade scope now includes exam-related collections (`exams` and `examns`) in addition to documents/resources/quizzes.
- Added explicit snapshot error fallback handling for subject topics listener: logs error, clears topics state, and releases loading.
- Added explicit error logging for resumen listener failures used in auto-completion updates.
