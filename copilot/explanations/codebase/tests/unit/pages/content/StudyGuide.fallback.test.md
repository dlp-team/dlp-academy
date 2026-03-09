// copilot/explanations/codebase/tests/unit/pages/content/StudyGuide.fallback.test.md

## Changelog
### 2026-03-09: New fallback and partial-data unit coverage
- Added controlled fallback test when guide document is missing.
- Added partial-data test for empty `studyGuide` arrays to ensure stable rendering without crashes.

## Overview
This suite validates `StudyGuide` resilience for missing/partial content payloads and route-bound load states.

## Notes
- Firestore and router hooks are mocked to isolate rendering behavior.
- Includes `IntersectionObserver` test shim for jsdom compatibility.
