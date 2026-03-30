<!-- copilot/explanations/codebase/tests/unit/utils/topicDeletionUtils.test.md -->
# topicDeletionUtils.test.js

## Overview
- **Source file:** `tests/unit/utils/topicDeletionUtils.test.js`
- **Last documented:** 2026-03-30
- **Role:** Unit coverage for shared topic cascade deletion utility behavior.

## Coverage
- Default cascade execution over all topic-linked collections.
- Graceful handling of query failures and delete failures.
- Not-found delete tolerance.
- Collection list normalization and deduplication.

## Changelog
### 2026-03-30
- Added first unit suite for `src/utils/topicDeletionUtils.js`.
- Covered exam/examns cleanup path and failure-tolerant behavior.
