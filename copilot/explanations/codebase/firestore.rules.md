// copilot/explanations/codebase/firestore.rules.md

## Changelog
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
