<!-- copilot/explanations/codebase/tests/unit/utils/notificationRetentionUtils.test.md -->
# notificationRetentionUtils.test.js

## Overview
- Source file: `tests/unit/utils/notificationRetentionUtils.test.js`
- Last documented: 2026-04-04
- Role: Deterministic unit suite for notification retention policy and expiration checks.

## Coverage
- Validates type-specific retention days and default fallback behavior.
- Validates timestamp normalization from Firestore-like timestamp objects and date strings.
- Validates expiration decisions against deterministic reference timestamps.
