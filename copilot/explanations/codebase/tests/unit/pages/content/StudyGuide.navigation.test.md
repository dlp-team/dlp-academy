// copilot/explanations/codebase/tests/unit/pages/content/StudyGuide.navigation.test.md

## Changelog
### 2026-04-02: TOC navigation selector stabilization
- Stabilized section-navigation click targeting by selecting the TOC-specific button variant (`group/item`) instead of relying on the first duplicated title match.
- Preserved assertion intent: the test still verifies scroll navigation is triggered after selecting a section from the table of contents.

## Overview
This suite validates keyboard and table-of-contents navigation behavior in `StudyGuide`, ensuring page navigation interactions trigger smooth-scroll actions in jsdom.

## Notes
- Firestore and router hooks are mocked to keep coverage deterministic.
- `IntersectionObserver` and `window.scrollTo` are shimmed/mocked in test setup.
- Selector strategy avoids false negatives caused by duplicate section titles rendered in multiple UI surfaces.
