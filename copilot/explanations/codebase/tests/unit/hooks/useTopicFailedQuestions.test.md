<!-- copilot/explanations/codebase/tests/unit/hooks/useTopicFailedQuestions.test.md -->
# useTopicFailedQuestions.test.js

## Overview
- **Source file:** `tests/unit/hooks/useTopicFailedQuestions.test.js`
- **Last documented:** 2026-03-30
- **Role:** Focused regression coverage for `useTopicFailedQuestions` derivation and listener-error reliability.

## Coverage
- Derives failed questions from latest attempts while excluding mastered entries.
- Clears stale failed-question state when a new topic listener fails.
- Confirms listener error logging path for attempts subscription.

## Changelog
### 2026-03-30
- Added initial focused test suite for listener error handling and failed-question derivation in `useTopicFailedQuestions`.
