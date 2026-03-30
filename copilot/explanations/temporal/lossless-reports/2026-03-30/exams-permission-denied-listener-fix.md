// copilot/explanations/temporal/lossless-reports/2026-03-30/exams-permission-denied-listener-fix.md

# Lossless Report - Exams Listener Permission Denied

## Requested Scope
- Fix `permission-denied` in exams realtime listener for already-created documents in root `exams` collection.

## Root Cause
- Some existing exam documents are legacy-shaped and pass subject queries (`where('subjectId', '==', subject.id)`) but do not satisfy the prior read rule fallbacks (missing/legacy `topicId` or owner metadata).
- Firestore rejects the listener query if any matching document is unreadable.

## Changes Applied
1. `firestore.rules`
- In `match /exams/{examId}` `allow read`, added fallback:
  - `hasSubjectRef(resource.data) && subjectInstitutionMatches(subjectRef(resource.data))`
- Existing checks (`canReadResource`, topic-based check, owner check) were preserved.
- Added helper `subjectReadableByRef(subjectId)` and migrated the exams subject fallback to this helper so shared subject access (`sharedWithUids`) and folder-manager paths are honored for legacy records.
- Added helper `topicReadableByRef(topicId)` and switched exams topic read fallback to this helper, allowing reads when topic ownership/shared-subject context is valid even if strict institution-only inference fails.

2. `src/pages/Topic/components/TopicContent.jsx`
- In teacher `materials` view, added AI exam cards from `topic.pdfs` (exam/evaluation types) under the StudyGuide/Fórmulas block so generated exam content appears for teachers in the AI-generated content area.
- Removed the `mainGuide` hard gate early return so exams are still rendered for teachers even when StudyGuide data is missing.
- Applied final visual refinement to match StudyGuide/FileCard style language for teacher exam cards (accent bar, subtle gradient backdrop, watermark icon, stronger CTA hierarchy).

## Preserved Behaviors
- No write/delete expansions were introduced.
- Student write restrictions for exams remain unchanged.
- Access remains institution/subject scoped via existing helper functions.

## Validation
- `get_errors` clean for `firestore.rules`.
- Full tests passed: `46/46` files, `289/289` tests.

## Deployment Note
- Rules fix is local until Firestore rules are deployed through the normal project workflow.
