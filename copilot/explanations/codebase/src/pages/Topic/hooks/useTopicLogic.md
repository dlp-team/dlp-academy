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

## [2026-03-08] Topic Deletion Orphan and Missing-Metadata Variants
### Context
- Topic deletion needed edge-case verification for orphaned child entries and missing institution metadata.

### Change
- Added unit coverage to verify deletion flow tolerates:
	- `not-found` child deletes for `documents`, `resumen`, and `quizzes`.
	- subject metadata without `institutionId`.

### Validation
- Focused unit suite passed: `npm run test -- tests/unit/hooks/useTopicLogic.test.js`.

## [2026-03-09] Topic Deletion Guard for Ghost/Read-Only Contexts
### Context
- Topic delete execution needed hard enforcement so read-only or ghost-context users cannot trigger destructive mutations directly.

### Change
- Added permission gate at `handleDeleteTopic` entry:
	- returns immediately when `canDelete(topic, user)` is false.
- This ensures delete side effects (confirm prompt, cascade deletes, navigation) only run for authorized users.

### Validation
- Updated `tests/unit/hooks/useTopicLogic.test.js` to verify:
	- delete-enabled paths by explicitly setting `canDelete = true`,
	- denied ghost/read-only path performs no prompt, no delete, and no navigation.
- Focused suite passed: `npm run test -- tests/unit/hooks/useTopicLogic.test.js tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useFolders.test.js`.

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

## Changelog
- 2026-03-29: Exam/examns fallback reads now suppress expected `permission-denied` noise and degrade to empty exam arrays without treating it as a fatal load failure.
- 2026-03-29: Added `handleChangeFileCategory` to update uploaded file categories from the `Mis Archivos` menu with realtime persistence and toast feedback.
- 2026-03-29: Upload flow now always requires category selection and supports batch categorization using `pendingFiles` with categories `material-teorico`, `ejercicios`, and `examenes` (legacy categories still supported downstream).
- 2026-03-29: Rename prefill robustness improved by defaulting to `file.name || file.title || ''`.
