// copilot/explanations/codebase/firestore.rules.md

## Changelog
### 2026-04-13: Resumen topic reference readability helper restored
- Added `topicReadableByRef(topicId)` helper used by `resumen` read rules.
- Keeps topic-level readability checks institution-scoped and owner/shared aware while preventing deny-path regressions caused by missing helper resolution.

### 2026-04-12: Direct messages same-institution policy and controlled peer notification creates
- Added `match /directMessages/{messageId}` with least-privilege constraints:
  - reads limited to participants in same institution, global admins, and same-institution institution admins,
  - creates require sender self-write, same-institution recipient, recipient existence check, and bounded message length,
  - updates limited to recipient read-ack fields,
  - deletes limited to global admin.
- Extended `notifications` create rule to allow controlled same-institution peer notification creation for supported types only:
  - `subject_shared`
  - `direct_message`
- Preserved existing self-write/institution-admin/global-admin notification paths.

### 2026-04-02: Shortcut move request least-privilege policy
- Added explicit `match /shortcutMoveRequests/{requestId}` block.
- Read access limited to:
  - global admins,
  - `requesterUid`,
  - `targetFolderOwnerUid`,
  - same-institution institution admins (`institutionId` scoped).
- Direct client writes (`create/update/delete`) are denied to enforce callable-only mutation through trusted backend code.

### 2026-04-02: Invite-code transaction preflight and same-batch subject reservation hardening
- Updated `subjectInviteCodes` create rule to validate subject ownership/institution via `existsAfter/getAfter`, enabling transaction-safe subject + invite-code creation in one atomic write.
- Updated `subjectInviteCodes` get rule to allow same-institution missing-doc preflight reads for non-student actors when the invite key matches the caller institution prefix.
- Preserved anti-enumeration behavior (`list` remains denied) and tenant boundaries (cross-institution key probes denied).

### 2026-04-01: Subject class assignment integrity and constrained student invite joins
- Added `classBelongsToInstitution(classId, institutionId)` and applied it to `subjects` create/update when `classId` is present.
- Added constrained student join path `canStudentJoinSubjectByInvite()` in `subjects` update rules.
- Student join updates are now limited to self-join semantics and only allow:
  - `sharedWithUids`
  - `enrolledStudentUids`
  - `isShared`
  - `updatedAt`
- Prevents student metadata edits while enabling invite-based enrollment safely.

### 2026-03-30: Teacher recognition-field constrained writes
- Added constrained teacher update path in `match /users/{userId}` for same-institution student documents.
- Allowed fields are restricted to recognition and teacher feedback surfaces only:
  - `badges`
  - `badgesByCourse`
  - `behaviorScore`
  - `updatedAt`
- Enforced immutability of student `role` and `institutionId` during teacher updates.

### 2026-03-30: Exams topic+subject readable helpers
- Added `topicReadableByRef(topicId)` and paired it with `subjectReadableByRef(subjectId)` in `exams` read logic.
- `exams` listeners now accept legacy/shared-access cases where strict `topicInstitutionMatches` alone would deny reads for valid teacher contexts.

### 2026-03-30: Exams shared-subject access compatibility
- Added `subjectReadableByRef(subjectId)` helper to evaluate subject read access with shared membership (`sharedWithUids`) and folder-manager ownership paths.
- Updated `exams` read fallback to use `subjectReadableByRef` so subject-scoped exam listeners no longer fail for shared users/legacy metadata combinations.

### 2026-03-30: Exams legacy read fallback by subject
- Updated `exams` read rule to allow subject-scoped access when documents have `subjectId`/`subject_id` but lack consistent `topicId` or owner metadata.
- This resolves realtime listener `permission-denied` errors for existing exam records queried by subject.

### 2026-03-29: Assignment submissions institution fallback
- Updated `topicAssignmentSubmissions` create/read/update rules to accept same-institution access when topic-level institution inference is insufficient, while still enforcing assignment existence and topic match.

### 2026-03-29: Topic assignments creator fallback
- Updated `topicAssignments` create/update rules to allow the authenticated creator path (`createdBy == request.auth.uid`) when a valid `topicId` exists, improving compatibility with legacy/missing institution metadata.

### 2026-03-29: Topic assignments permissions enabled
- Added explicit `topicAssignments` rules with non-student write constraints and topic/institution-scoped checks.
- Added explicit `topicAssignmentSubmissions` rules so students can create/update only their own submissions while teachers/admins can read topic-scoped deliveries.
- Preserved global-admin bypass and kept delete blocked for submissions.

### 2026-03-29: Notifications access policy added
- Added explicit `notifications` collection rules to avoid implicit deny for realtime reads.
- Access model:
  - Global admin: full access.
  - User: can read/create/update/delete own notifications where `userId == request.auth.uid`.
  - Institution admin: can manage notifications scoped to own `institutionId`.

### 2026-03-09: Admin and institution-boundary hardening
- Tightened `institution_invites` security boundaries:
  - `list` now restricted to global admins or institution admins within matching institution,
  - `delete` institution path now requires institution admin role for same-institution deletion.
- Tightened non-admin write requirements on key collections:
  - `folders`, `topics`, `documents`, and `quizzes` now require `request.resource.data.institutionId` to match current user institution for non-admin create/update paths.

## Overview
`firestore.rules` defines role-aware and institution-scoped access control for app collections.

## Notes
- Global admins preserve bypass behavior where intended.
- New constraints reduce legacy owner-only bypasses for writes lacking institution scoping.
