<!-- copilot/explanations/codebase/src/utils/topicDeletionUtils.md -->
# topicDeletionUtils.js

## Overview
- **Source file:** `src/utils/topicDeletionUtils.js`
- **Last documented:** 2026-03-30
- **Role:** Shared utility for best-effort cascade cleanup of topic-linked collections.

## Responsibilities
- Defines default cascade collections for topic deletion.
- Normalizes/validates custom collection lists.
- Queries and deletes topic-linked docs across collections.
- Tolerates query and delete failures while returning structured failure summaries.

## Exports
- `DEFAULT_TOPIC_CASCADE_COLLECTIONS`
- `cascadeDeleteTopicResources`

## Main Dependencies
- `firebase/firestore`

## Changelog
### 2026-03-30
- Added centralized cascade deletion helper for topic-linked resources.
- Included exam collections (`exams`, `examns`) in default cleanup scope.
- Added not-found tolerant delete behavior to avoid blocking parent topic deletion.
