<!-- copilot/explanations/codebase/src/hooks/useSubjects.md -->
## [2026-04-12] Shared Notification Identity Metadata
### Context
- Shared-subject notifications needed explicit sharer identity rendering in centralized notification cards.

### Change
- Extended `notifySubjectShareRecipient(...)` payload with:
  - `sharedByDisplayName`
  - `sharedByPhotoURL`
- Preserved existing fields (`sharedByUid`, `sharedByEmail`) and deterministic notification ID behavior.

### Impact
- Notification surfaces can now render sharer avatar/name directly for `subject_shared` events.

## [2026-04-08] Subject Share and Assignment Notification Dispatch
### Context
- Phase 07 requires user-facing notifications when subjects are shared and when student access is assigned through class or direct enrollment flows.

### Change
- Added recipient-filtering and notification upsert helpers inside `useSubjects`:
  - recipient eligibility filtering enforces tenant match and optional student-role requirement,
  - deterministic notification IDs avoid duplicate fan-out drift,
  - writes use merged `setDoc` upserts into `notifications`.
- `shareSubject(...)` now dispatches `subject_shared` notifications for newly shared recipients.
- `updateSubject(...)` now computes assignment deltas and dispatches:
  - `subject_assigned_class` for new class-linked student recipients,
  - `subject_assigned_student` for newly enrolled direct student recipients.
- Assignment notifications are best-effort and do not block subject persistence when notification writes fail.

### Validation
- Focused suite passed:
  - `npm run test:unit -- tests/unit/hooks/useSubjects.test.js`

## [2026-04-03] Subject Update Payload Normalizes Period Lifecycle Boundaries
### Context
- Phase 04 introduces subject-level period timeline metadata to support role-aware lifecycle transitions.

### Change
- `updateSubject(...)` now normalizes boundary fields to date-only ISO values or `null`:
  - `periodStartAt`
  - `periodEndAt`
  - `periodExtraordinaryEndAt`
- `updateSubject(...)` now normalizes `postCoursePolicy` to allowed policy values:
  - `delete`
  - `retain_all_no_join`
  - `retain_teacher_only`

### Impact
- Prevents invalid date-string drift in lifecycle fields consumed by Home visibility filtering.

## [2026-04-03] Subject Update Payload Normalizes `courseId` and `academicYear`
### Context
- Subject saves started persisting optional course linkage metadata (`courseId`) and year metadata (`academicYear`) from modal flows.

### Change
- `updateSubject(...)` now trims and normalizes optional `courseId` and `academicYear` fields before writing.
- `updateSubject(...)` now also normalizes period metadata fields:
  - `periodType`
  - `periodLabel`
  - `periodIndex` (coerced to positive integer or `null`)
- Empty values are coerced to `null` for consistent Firestore shape.

### Impact
- Prevents whitespace/empty-string drift in subject metadata used by class-year filtering and future lifecycle automation.

## [2026-04-03] Invite-Code Sync Is Best-Effort After Subject Save
### Context
- Subject updates could succeed in Firestore while follow-up invite-code mapping sync failed, surfacing a false save error in Home flows.

### Change
- `updateSubject(...)` now keeps invite-code mapping sync (`subjectInviteCodes`) as a best-effort step after the main subject document update.
- Mapping-sync failures are logged with `console.warn` and no longer throw back to the caller.

### Impact
- Prevents false-negative “no se pudo guardar” feedback when the core subject update has already succeeded.

## [2026-04-02] Active-Role Access Context Wiring
### Context
- Subject listeners and policy gates were still keyed from legacy normalized base-role reads.

### Change
- `useSubjects` now resolves role context with `getActiveRole(user)`.
- Teacher policy guards, listener role branches, and invite-join institution admin exception checks now use active role semantics.

### Impact
- Subject data access and teacher policy enforcement stay consistent after in-session role switches.

## [2026-04-01] Student invite join write-surface hardening
### Context
- Rules now allow student invite joins only through a constrained update payload.

### Change
- Updated `joinSubjectByInviteCode(...)` so student joins write only:
  - `sharedWithUids`
  - `enrolledStudentUids`
  - `isShared`
  - `updatedAt`
- Non-student invite joins keep writing `sharedWith` entries for explicit share metadata.

### Validation
- `npm run test:unit -- tests/unit/hooks/useSubjects.test.js`
- `npm run test:rules`

## [2026-04-01] User-Scoped Subject Completion Tracking
### Context
- Phase 10 required persisted completion state per user and a hook API consumable by Home views.

### Change
- Added derived `completedSubjectIds` from `user.completedSubjects` with trim/dedupe normalization.
- Added `setSubjectCompletion(subjectId, completed)`:
  - writes to `users/{uid}.completedSubjects` using `arrayUnion` when completing,
  - writes using `arrayRemove` when reverting to active.

### Validation
- `npm run test -- tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useHomeState.completionTracking.test.js`

## [2026-04-01] Teacher Autonomous Subject Creation Policy Enforcement
### Context
- Phase 09 required institution-level control over whether teachers can create subjects autonomously.

### Change
- Added teacher policy preload state (`teacherSubjectCreationAllowed`) in `useSubjects`.
- Added `ensureTeacherCanCreateSubject(...)` gate to `addSubject(...)`.
- Teacher subject creation now throws explicit user-facing denial message when institution policy disables autonomous creation.

### Validation
- Focused unit + rules validation passed:
  - `npm run test -- tests/unit/utils/permissionUtils.test.js tests/unit/hooks/useHomeCreationGuards.test.js tests/unit/hooks/useSubjects.test.js tests/unit/pages/institution-admin/UsersTabContent.removeAccessConfirm.test.jsx`
  - `npm run test:rules`

## [2026-03-30] Subject Permanent Delete Now Uses Shared Topic Cascade Utility
### Context
- Subject permanent deletion still had inline duplicate cleanup logic for topic-linked artifacts.
- Phase 05 required consistent cleanup coverage for exam artifacts as well.

### Change
- `permanentlyDeleteSubject` now delegates per-topic cleanup to `cascadeDeleteTopicResources` from `src/utils/topicDeletionUtils.js`.
- Cleanup scope now uses `DEFAULT_TOPIC_CASCADE_COLLECTIONS`, which includes:
  - `documents`
  - `resumen`
  - `quizzes`
  - `exams`
  - `examns`
- Preserved best-effort behavior: cleanup/query failures are logged and do not block final topic/subject deletion.

### Validation
- Focused suite passed: `npm run test -- tests/unit/hooks/useSubjects.test.js tests/unit/utils/topicDeletionUtils.test.js tests/unit/hooks/useSubjectManager.test.js tests/unit/hooks/useTopicLogic.test.js`.

## [2026-03-13] Shared Shortcut Visibility: Immediate Subject Render Before Topic Hydration
### Context
- Shared shortcuts could appear delayed after refresh/theme toggle because subject list rendering waited for topic hydration (`Promise.all`) to complete.

### Change
- `updateSubjectsState` now performs a two-step update:
  1) immediately sets subject list with cached/empty `topics`,
  2) asynchronously hydrates topics and updates state again.

### Validation
- `get_errors` reports no issues in `src/hooks/useSubjects.js`.

## [2026-03-08] Permanent Delete Cascade Expanded to Quizzes and Resources
### Context
- Subject permanent deletion coverage required full topic dependency cleanup, including generated resources and quizzes.

### Change
- Updated `permanentlyDeleteSubject` in `src/hooks/useSubjects.js` to cascade delete, per topic:
  - `documents`
  - `resumen` resources
  - `quizzes`
- Preserved existing best-effort behavior: query/deletion failures are logged and do not block final topic/subject cleanup.

### Validation
- Focused unit suite passed: `npm run test -- tests/unit/hooks/useSubjects.test.js`.

## [2026-03-08] Test Hardening: Owner-Scoped Shortcut Cleanup on Subject Delete
### Context
- Permanent subject deletion intentionally cleans owner-managed shortcuts while avoiding deletion of recipient-owned shortcut entries.

### Validation Additions
- Added targeted unit coverage in `tests/unit/hooks/useSubjects.test.js` validating:
  - shortcut cleanup query is owner-scoped (`ownerId === currentUser.uid`),
  - owner shortcut is deleted,
  - non-owner ghost/orphan shortcuts are not targeted by the owner cleanup flow.

### Validation
- Focused suite passed: `npm run test -- tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useFolders.test.js tests/unit/hooks/useTopicLogic.test.js`.

## [2026-03-09] Test Hardening: Shared-Folder Permission and Multi-Editor Delete Paths
### Context
- Permanent subject deletion needed explicit shared-context permission coverage beyond base owner/non-owner checks.

### Validation Additions
- Added unit tests in `tests/unit/hooks/useSubjects.test.js` to verify:
  - shared collaborator/editor cannot permanently delete a subject when not owner,
  - owner can still permanently delete subjects shared with multiple editors/viewers.

### Validation
- Consolidated suite passed: `npm run test -- tests/unit/hooks/useHomeHandlers.shortcuts.test.js tests/unit/hooks/useSubjects.test.js tests/unit/hooks/useFolders.test.js tests/unit/hooks/useTopicLogic.test.js tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`.

## [2026-03-07] Home Data Readiness No Longer Requires Country
### Context
- Country was removed from required registration profile fields.

### Change
- `canReadHomeData` now requires `role` + `displayName` only in `src/hooks/useSubjects.js`.

### Validation
- Unit suite remained green (`npm run test`).

## [2026-03-07] Subject Code Generation Ownership Update
### Context
- Subject invite codes must be system-generated; teachers should not manually define invite codes during creation.
- Enrollment lists should not be required as an input constraint at creation time.

### Change
- Updated `addSubject` in `src/hooks/useSubjects.js` to always initialize `inviteCode` using `generateSubjectInviteCode()`.
- This ignores any incoming `payload.inviteCode` at creation and guarantees platform-generated code ownership.

### Validation
- Updated and passed unit tests in `tests/unit/hooks/useSubjects.test.js` to reflect the additional initial code-generation call.

## [2026-03-06] Feature Addition: Join Subject by Invite Code
### Context & Behavior
- Added `joinSubjectByInviteCode(inviteCodeInput)` to support runtime join-by-code from the client hook.
- Flow now validates invite key format, checks `subjectInviteCodes` ownership/institution scope, resolves the target subject, and blocks trashed/non-existent targets.
- If the user is already owner/shared/enrolled, method returns early with `{ alreadyJoined: true }`.
- On first join, the hook now:
  - appends access via `sharedWithUids/sharedWith`,
  - auto-enrolls students in `enrolledStudentUids`,
  - upserts deterministic shortcut document for Home access.

## [2026-03-06] Test Hardening: Invite Code Transaction Paths
### Context & Validation Additions
- Added focused unit coverage for `useSubjects.addSubject` transactional invite reservation behavior in `tests/unit/hooks/useSubjects.test.js`.
- New tests now assert:
  - collision retry regenerates a code and succeeds,
  - repeated collisions stop after 10 attempts with the expected user-facing error,
  - non-collision transaction failures (for example permission denied) do not retry and bubble the failure.

## [2026-02-26] Feature Update: Subject Share Role Upsert
### Context & Architecture
`useSubjects.shareSubject` is invoked by subject sharing UIs and writes sharing metadata to Firestore (`subjects`) while ensuring recipient shortcut provisioning.

### Previous State
- `shareSubject` treated all new shares as `viewer`.
- If a user was already shared, there was no role update path in this method.

### New State & Logic
- Extended signature to `shareSubject(subjectId, email, role = 'viewer')`.
- Added role normalization and role-aware share payload.
- Added in-place update of `sharedWith` role when user was already shared (without duplicating entries).
- Return payload now indicates `alreadyShared` and `roleUpdated`, enabling richer UI feedback.

---

# useSubjects.js

## Purpose
- **Source file:** `src/hooks/useSubjects.js`
- **Last documented:** 2026-02-24
- **Role:** Custom React hook that manages all subject CRUD operations and real-time synchronization with Firestore, including sharing, topic loading, and institution filtering.

## High-Level Architecture

This hook follows a **dual-listener pattern** with **automatic topic hydration**:
1. **Real-time listener** on owned subjects (where `ownerId === user.uid`)
2. **Lazy topic population**: For each subject, queries and loads its related topics from the `topics` collection
3. **Institution filtering**: Automatically filters subjects by current institution to prevent cross-institution leaks
4. **Fire-and-forget async operations**: Add, update, delete, share, and touch operations

## Functions Explained
### useSubjects
- **Type:** const arrow
- **Parameters:** `user`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### updateSubjectsState
- **Type:** const arrow
- **Parameters:** none
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Referenced internally 1 time(s), indicating reuse/composition.

### addSubject
- **Type:** const arrow
- **Parameters:** `payload`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### updateSubject
- **Type:** const arrow
- **Parameters:** `id`, `payload`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### deleteSubject
- **Type:** const arrow
- **Parameters:** `id`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### touchSubject
- **Type:** const arrow
- **Parameters:** `id`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### shareSubject
- **Type:** const arrow
- **Parameters:** `subjectId`, `email`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

### unshareSubject
- **Type:** const arrow
- **Parameters:** `subjectId`, `email`
- **What it does:** Encapsulates a focused part of this file's behavior and contributes to the module output.
- **Internal relation:** Not explicitly re-invoked by name internally (likely entry/export function).

## Function Relations
- **External calls used by this file:**
  - `useState()` from `react` is called 2 time(s).
  - `useEffect()` from `react` is called 1 time(s).
- **Internal function interactions:**
  - `updateSubjectsState()` is reused inside this file (1 additional call(s)).

## Imports and Dependencies
- `react`: `useState`, `useEffect`
- `../firebase/config`: `db`

## Example
```jsx
import { useSubjects } from '../hooks/useSubjects';

function ExampleComponent() {
  const state = useSubjects();
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
}
```

## Maintenance Notes
- Keep this explanation updated when adding, renaming, or deleting functions in the source file.
- If imported dependencies change, update the relation mapping and the example snippet accordingly.
