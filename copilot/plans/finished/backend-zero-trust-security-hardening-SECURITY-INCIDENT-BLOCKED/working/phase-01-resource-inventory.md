<!-- copilot/plans/todo/backend-zero-trust-security-hardening/working/phase-01-resource-inventory.md -->
# Phase 01 Resource Inventory (Active Code)

## Firestore Collections (observed in active `src/**` + rules)
- `users`
- `institutions`
- `institution_invites`
- `subjects`
- `subjectInviteCodes`
- `folders`
- `topics`
- `documents`
- `resumen`
- `quizzes`
- `shortcuts`
- `classes`
- `subject_class_requests`
- `courses`
- `exams`
- `notifications`

## Firestore Subcollections
- `subjects/{subjectId}/topics/{topicId}`
- `subjects/{subjectId}/topics/{topicId}/resumen/{docId}`
- `subjects/{subjectId}/topics/{topicId}/materials/{docId}`
- `subjects/{subjectId}/topics/{topicId}/quizzes/{quizId}`
- `subjects/{subjectId}/topics/{topicId}/quiz_results/{resultId}`
- `subjects/{subjectId}/topics/{topicId}/documents/{docId}`

## Storage Paths (observed)
- `profile-pictures/{userId}`
- `institutions/{institutionId}/branding/icon.{ext}`
- `institutions/{institutionId}/branding/logo.{ext}`

## Privileged Backend Entry Points (`functions/index.js`)
- Callable: `validateInstitutionalAccessCode`
- Callable: `getInstitutionalAccessCodePreview`

## Trust Boundary Map
- Client app (`src/**`) performs direct Firestore + Storage operations.
- Rules layer (`firestore.rules` and `storage.rules`) is primary policy enforcement.
- Callable functions enforce additional role/tenant checks for dynamic access-code workflows.

## Inventory Notes
- Archive files under `src/archive/**` were excluded from execution inventory.
- Active UI touches both root collections and nested subcollections for study-content features.
