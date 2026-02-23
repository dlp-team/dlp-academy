# Migration Plan: Topic Relations to Camel Case + Remove Embedded Lists

## Goal
Normalize topic/document/quiz relations to camelCase and remove embedded denormalized lists from topic documents:

- `topics.subject_id` -> `topics.subjectId`
- `documents.subject_id` -> `documents.subjectId`
- `documents.topic_id` -> `documents.topicId`
- `quizzes.subject_id` -> `quizzes.subjectId`
- `quizzes.topic_id` -> `quizzes.topicId`
- Remove `topics.pdfs` and `topics.quizzes`

## Why
- Keeps schema consistent with `ownerId`, `institutionId`, and other camelCase fields.
- Avoids duplicated state (`topics.pdfs` and `topics.quizzes`) that can drift from root collections.
- Makes retrieval deterministic: Topic page reads related `documents` and `quizzes` from root collections using `topicId`.

## Scope
- Firestore data migration for existing root collections.
- Existing subcollection-to-root migration script output normalization.
- App query/write changes to use `subjectId`/`topicId`.
- Firestore rules updates to accept camelCase (and temporarily legacy snake_case).

## Pre-Checks
1. Export Firestore backup.
2. Ensure rules deploy rights are available.
3. Confirm required index exists for topic list:
   - Collection: `topics`
   - Fields: `subjectId` (Ascending), `order` (Ascending)

## Execution Plan
1. Deploy app/rules changes that can read both legacy and new fields.
2. Dry run migration script:
   - `DRY_RUN=true node scripts/migrate-relations-to-camelcase.cjs`
3. Live run migration script:
   - `DRY_RUN=false node scripts/migrate-relations-to-camelcase.cjs`
4. Deploy Firestore rules.
5. Verify in UI:
   - Subject page topics list loads.
   - Topic page loads generated materials (`pdfs` tab) from root `documents` where `source != 'manual'`.
   - Topic page loads uploads (`uploads` tab) from root `documents` where `source == 'manual'`.
   - Topic page quizzes load from root `quizzes` by `topicId`.
6. After validation window, remove legacy snake_case support from rules if desired.

## Rollback
- Restore Firestore backup if migration results are incorrect.
- Revert code/rules commit and redeploy.

## Post-Migration Validation Queries
- `topics` missing camelCase relation:
  - `where('subjectId', '==', null)` (or inspect docs with missing key)
- `documents` missing relation:
  - check docs where `topicId` or `subjectId` absent
- `quizzes` missing relation:
  - check docs where `topicId` or `subjectId` absent
- Confirm no topic docs contain embedded arrays/maps:
  - no `pdfs`, no `quizzes`
