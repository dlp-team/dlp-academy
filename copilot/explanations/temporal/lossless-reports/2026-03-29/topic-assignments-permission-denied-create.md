// copilot/explanations/temporal/lossless-reports/2026-03-29/topic-assignments-permission-denied-create.md

# Lossless Report - Topic Assignments Create Permission Fix

## Requested Scope
- Fix `Missing or insufficient permissions` when creating tasks from `TopicAssignmentsSection.jsx`.
- Enable assignment instruction attachments and student delivery with file attachments.

## Root Cause
- `topicAssignments` and `topicAssignmentSubmissions` had no explicit blocks in `firestore.rules`, so writes were denied by default.
- Assignment create payload depended on `user.institutionId`, which can be absent for some sessions/users.

## Changes Applied
1. `firestore.rules`
- Added `match /topicAssignments/{assignmentId}` with:
  - read: topic/institution scoped (`topicInstitutionMatches`) plus owner/admin compatibility.
  - create/update: non-student gated and institution/topic validated.
  - delete: admin/creator/topic-manager compatible.
- Refined create/update with explicit creator fallback (`createdBy == request.auth.uid`) when a valid topic document exists, reducing false-deny cases for legacy documents without stable institution metadata.
- Added `match /topicAssignmentSubmissions/{submissionId}` with:
  - create/update constrained to signed-in owner (`userId == request.auth.uid`) and valid topic/assignment linkage.
  - read allowed for owner, admin, and topic-scoped managers.
  - delete blocked.
- Refined submissions create/read/update with same-institution fallback checks to reduce false-deny scenarios for students delivering files.

2. `src/pages/Topic/components/TopicAssignmentsSection.jsx`
- Added robust institution resolution fallback chain:
  - `user.institutionId` -> `subjects/{subjectId}.institutionId` -> `topics/{topicId}.institutionId`.
- Added create guard when institution cannot be resolved.
- Assignment create payload now includes `institutionId`, `ownerId`, and `createdBy`.
- Submission writes now include `institutionId` for consistency.
- Added teacher assignment instruction attachment upload flow:
  - multi-file picker in create panel,
  - Storage uploads before assignment write,
  - `instructionFiles` metadata persisted in assignment document.
- Added student delivery attachment flow:
  - per-assignment note + file selection UI,
  - Storage uploads during delivery action,
  - `submissionFiles` and `note` persisted in submission document,
  - submitted file links visible in student card.

## Preserved Behaviors
- Existing assignment sorting/filtering and due-date status logic unchanged.
- Existing teacher visibility/late-delivery controls preserved.
- Existing non-fatal feedback behavior preserved.

## Validation
- `get_errors` clean for changed files:
  - `firestore.rules`
  - `src/pages/Topic/components/TopicAssignmentsSection.jsx`
- Test suite passed:
  - `Test Files 46 passed (46)`
  - `Tests 289 passed (289)`

## Notes
- Firestore rules changes are local until deployed by the user workflow.
