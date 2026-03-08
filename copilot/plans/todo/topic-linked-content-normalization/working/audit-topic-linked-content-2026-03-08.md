<!-- copilot/plans/todo/topic-linked-content-normalization/working/audit-topic-linked-content-2026-03-08.md -->
# Audit - Topic-Linked Content Model (2026-03-08)

## Executive Summary

The platform is partially normalized.

- Good: `documents`, `resumen`, and `quizzes` are loaded from root collections filtered by `topicId`.
- Gap: `exams` uses `topicid` (lowercase), which breaks canonical alignment and likely explains missing exams in Topic view.
- Risk: legacy embedded arrays (`topic.pdfs`, `topic.quizzes`) still influence side logic and can reintroduce duplication.

## Current Implementation Audit

### 1. Topic read model in Topic page

Source: `src/pages/Topic/hooks/useTopicLogic.js`

- Topic base document loaded from `topics/{topicId}`.
- Documents loaded from root `documents` where `topicId == topicId`.
- Resumen loaded from root `resumen` where `topicId == topicId`.
- Quizzes loaded from root `quizzes` where `topicId == topicId`.
- Exams loaded from root `exams` where `topicid == topicId` (non-canonical lowercase key).

Impact:
- If an exam document uses `topicId`, it will not be returned by current query.
- Mixed field names split data visibility.

### 2. Topic write model

Source: `src/pages/Topic/hooks/useTopicLogic.js`, `src/pages/Subject/hooks/useSubjectManager.js`

- Manual file upload writes into root `documents` with `topicId` and `subjectId`.
- Topic creation writes `topics` root docs with canonical fields.
- Topic-level docs added during creation also use canonical `topicId`.

Good state:
- Most write paths are already camelCase and relational.

### 3. Side logic still tied to embedded arrays

Source: `src/pages/Subject/hooks/useSubjectManager.js`

- Auto-status logic still checks `topic.quizzes` and `topic.pdfs` to mark topic completed.
- This conflicts with normalized architecture where child content lives in root collections.

Impact:
- Status transitions can be wrong if embedded arrays are stale/absent.

### 4. Security rules alignment

Source: `firestore.rules`

- Root rules for `topics`, `documents`, `resumen`, and `quizzes` are relation-aware through topic/subject helpers.
- `/exams/{examId}` currently allows read/write for any signed-in user (broad permissive rule).

Impact:
- Exams security posture is weaker than other topic-linked collections.
- No explicit tenant/ownership validation based on related topic.

### 5. Migration and schema assets

Source: `scripts/migration-plan-topic-relations-camelcase.md`, `scripts/migrate-subject-topics-to-root.cjs`

- Existing migration guidance covers topic/document/quiz normalization.
- Exams are not covered in the same normalization path.
- `firestore.indexes.json` is currently empty; no explicit index declarations tracked.

## Target Model (Canonical)

All topic-linked content should follow this contract:

- Collection-level source of truth in root collections.
- Required fields on child records:
  - `topicId`
  - `subjectId`
  - `ownerId`
  - `institutionId`
- No embedded child arrays in topic docs (`pdfs`, `quizzes`, `exams`, etc.).
- Reads always query by `topicId`.
- Writes always set canonical fields.
- Rules enforce relation checks via topic and subject linkage.

## Delta: What Must Change

1. Normalize exams query/write paths to `topicId` (remove lowercase `topicid` dependency).
2. Add exams data migration/backfill for legacy keys and missing canonical relations.
3. Refactor topic status logic to derive completion from root collections, not embedded arrays.
4. Harden `/exams` rules to match relation-aware constraints used by `/quizzes` and `/documents`.
5. Define and deploy indexes required by canonical query patterns.
6. Remove temporary compatibility and legacy key handling after migration verification.

## Suggested Verification Queries (Post-Migration)

- Exams missing canonical linkage:
  - docs where `topicId` is absent.
- Documents missing canonical linkage:
  - docs where `topicId` or `subjectId` is absent.
- Quizzes missing canonical linkage:
  - docs where `topicId` or `subjectId` is absent.
- Topics with embedded duplicate arrays:
  - docs containing keys like `pdfs`, `quizzes`, `exams`.

## Key Risk Register

- Data split risk due to `topicid` vs `topicId` coexistence.
- Orphan cleanup risk if deletion flows do not include all topic-linked collections.
- Security inconsistency risk while `/exams` remains broad-open for authenticated users.
