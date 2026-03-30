<!-- copilot/explanations/codebase/src/pages/Topic/hooks/useTopicFailedQuestions.md -->
# useTopicFailedQuestions.js

## Overview
- **Source file:** `src/pages/Topic/hooks/useTopicFailedQuestions.js`
- **Last documented:** 2026-03-30
- **Role:** Derives non-mastered failed quiz questions for a topic from quiz attempts and mastered-question snapshots.

## Responsibilities
- Subscribes to `quizAttempts` by `userId` + `topicId`.
- Subscribes to mastered-question state in `repasoMastered/{uid}__{topicId}`.
- Builds deterministic failed-question output from latest attempt per quiz.
- Excludes already-mastered failed questions.

## Changelog
### 2026-03-30
- Hardened listener failure handling for both attempts and mastered-question subscriptions.
- Attempts listener failures now clear stale attempt/mastered state and stop loading.
- Mastered-question listener failures now clear mastered state to avoid stale exclusions.
