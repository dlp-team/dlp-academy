## [2026-03-08] Topic Deletion Cascade Expanded
### Context
- Topic deletion coverage required cleanup of topic-linked artifacts before deleting the topic.

### Change
- `handleDeleteTopic` now performs best-effort cascade cleanup for:
	- `documents`
	- `resumen`
	- `quizzes`
- Cleanup failures are logged and tolerated so final topic deletion and navigation still proceed.

### Validation
- Focused unit suite passed: `npm run test -- tests/unit/hooks/useTopicLogic.test.js`.

# useTopicLogic.js

## Overview
- **Source file:** `src/pages/Topic/hooks/useTopicLogic.js`
- **Last documented:** 2026-02-24
- **Role:** Custom hook with stateful/business logic for this page area.

## Responsibilities
- Manages local UI state and interaction flow.
- Executes side effects tied to lifecycle or dependency changes.
- Handles user events and triggers updates/actions.
- Interacts with Firebase/Firestore services for data operations.
- Participates in navigation/routing behavior.

## Exports
- `const useTopicLogic`

## Main Dependencies
- `react`
- `react-router-dom`
- `firebase/firestore`
- `../../../firebase/config`
- `../../../utils/permissionUtils`

## Notes
- This explanation is synchronized to the mirrored structure under `copilot/explanations/codebase/src/pages` for maintenance and onboarding.
