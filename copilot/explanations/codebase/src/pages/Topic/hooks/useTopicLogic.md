<!-- copilot/explanations/codebase/src/pages/Topic/hooks/useTopicLogic.md -->
## [2026-03-31] Topic Child Listener Re-subscribe Teardown Hardening
### Context
- `useTopicLogic` re-attached `documents`, `resumen`, and `quizzes` listeners every time the topic snapshot emitted.
- Previous listener instances were overwritten without explicit teardown, creating duplicate listener risk on topic updates.

### Change
- Added `teardownTopicChildListeners` in the main loading effect.
- Child listeners are now explicitly unsubscribed before re-subscribing on topic snapshot re-emits.
- Topic not-found and topic listener error branches now also teardown child listeners and clear local listener caches before fallback navigation.

### Validation
- Extended `tests/unit/hooks/useTopicLogic.test.js` with a regression assertion that first-generation child listeners are unsubscribed before second-generation listeners are attached.

## [2026-03-30] Topic Destructive Actions Now Use In-Page Confirmation Modal
### Context
- Topic workflows still relied on browser `window.confirm(...)` dialogs for destructive actions.
- This caused inconsistent UX compared to in-page modal and toast patterns used in the rest of the platform.

### Change
- Added confirmation state machine inside `useTopicLogic`:
	- `confirmDialog`
	- `isConfirmingAction`
	- `closeConfirmDialog`
	- `confirmDeleteAction`
- Converted these handlers to queue confirmation first and execute only after modal accept:
	- `deleteFile`
	- `deleteQuiz`
	- `handleDeleteTopic`
- Topic deletion execution remains best-effort and still delegates cascade cleanup to `cascadeDeleteTopicResources`.

### Validation
- Updated `tests/unit/hooks/useTopicLogic.test.js` with confirmation-path assertions for file, quiz, and topic deletion.

## [2026-03-30] Topic Alert Removal and Toast Feedback Hardening
### Context
- Topic workflow still relied on browser alerts for several failure/info branches, creating inconsistent UX compared to inline/toast feedback paths used elsewhere.

### Change
- Replaced alert dialogs with `showNotification(...)` toasts for:
	- rename failure,
	- file delete failure,
	- file category update failure,
	- quiz delete failure,
	- empty-file view attempt,
	- manual-upload categorization failure.
- Preserved existing success-path behavior and permission guards.

### Validation
- Updated focused coverage in `tests/unit/hooks/useTopicLogic.test.js`.

## [2026-03-30] Topic Snapshot Listener Toast Feedback Hardening
### Context
- Documents/resumen/quizzes snapshot failures in `useTopicLogic` reset local fallback state but did not always provide explicit user feedback for non-permission failures.

### Change
- Added non-blocking `showNotification(...)` feedback for non-`permission-denied` errors in:
	- documents listener,
	- resumen listener,
	- quizzes listener.
- Preserved existing fallback behavior and loading exits in each listener error callback.

### Validation
- Extended focused hook coverage in `tests/unit/hooks/useTopicLogic.test.js` to assert quizzes snapshot listener failures surface toast feedback.

## [2026-03-30] Topic Delete Flow Centralized and Exam Cleanup Expanded
### Context
- Topic deletion logic was duplicated across hooks and did not consistently include exam collections when deleting from all entry points.

### Change
- `handleDeleteTopic` now delegates cascade cleanup to shared utility `cascadeDeleteTopicResources`.
- Default cascade scope now includes:
	- `documents`
	- `resumen`
	- `quizzes`
	- `exams`
	- `examns`

### Validation
- Updated focused unit coverage: `tests/unit/hooks/useTopicLogic.test.js`.

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
- 2026-03-31: Added deterministic teardown for nested topic child listeners before re-subscribing on topic snapshot updates; not-found/error branches now clear child listeners to avoid duplicate subscriptions.
- 2026-03-30: Replaced `window.confirm(...)` destructive prompts with in-page modal-confirmed delete flow (`confirmDialog` + `confirmDeleteAction`) for file, quiz, and topic actions.
- 2026-03-30: Removed remaining browser-alert error/info paths in Topic workflows and standardized these branches on toast notifications.
- 2026-03-29: Exam/examns fallback reads now suppress expected `permission-denied` noise and degrade to empty exam arrays without treating it as a fatal load failure.
- 2026-03-29: Added `handleChangeFileCategory` to update uploaded file categories from the `Mis Archivos` menu with realtime persistence and toast feedback.
- 2026-03-29: Upload flow now always requires category selection and supports batch categorization using `pendingFiles` with categories `material-teorico`, `ejercicios`, and `examenes` (legacy categories still supported downstream).
- 2026-03-29: Rename prefill robustness improved by defaulting to `file.name || file.title || ''`.
