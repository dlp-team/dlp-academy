<!-- copilot/explanations/codebase/tests/unit/pages/institution-admin/themePreviewUtils.messagePayload.test.md -->
# themePreviewUtils.messagePayload.test.js

## Overview
- **Source file:** `tests/unit/pages/institution-admin/themePreviewUtils.messagePayload.test.js`
- **Last documented:** 2026-04-07
- **Role:** Verifies live iframe message payload builder contracts for theme + highlight preview synchronization.

## Coverage
- Message envelope includes canonical `source` and `type` values.
- Payload includes theme CSS and normalized preview role.
- Active token adds highlight CSS and descriptive highlight message.

## Changelog
### 2026-04-07
- Added payload-construction regression suite for Phase 04 postMessage integration.
