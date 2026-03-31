<!-- copilot/explanations/codebase/tests/unit/pages/topic/TopicModals.test.md -->
# TopicModals.test.jsx

## Overview
- **Source file:** `tests/unit/pages/topic/TopicModals.test.jsx`
- **Last documented:** 2026-03-31
- **Role:** Unit coverage for Topic file-viewer modal fallback behavior.

## Coverage
- Embedded viewer loading feedback appears while iframe preview is unresolved.
- Timeout-driven viewer failure shows explicit fallback error state.
- Retry action moves the viewer back to loading state from error fallback.

## Changelog
### 2026-03-31
- Added regression coverage for Slice 31 TopicModals file-viewer fallback hardening.
