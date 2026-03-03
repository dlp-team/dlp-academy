# Phase 04 — Subject, Topic, and Content Navigation Coverage (IN_PROGRESS)

## Objective

Ensure core learning navigation from subject to topics and content viewers remains stable.

## Planned Changes / Actions

- Add Playwright journeys for:
  - Opening a subject from Home.
  - Rendering Topic Grid and opening a topic.
  - Opening study guides/resources and validating content page render.
- Add Vitest coverage for:
  - `src/pages/Subject/hooks/useSubjectManager.js`
  - `src/pages/Topic/hooks/useTopicLogic.js`
  - `src/pages/Subject/hooks/useTopicGridDnD.js`

## Risks

- Topic and content routes rely on nested params and can break with route refactors.
- Resource visibility rules can differ by role and sharing state.

## Completion Criteria

- Subject/topic/content E2E flows pass with valid seeded entities.
- Unit tests cover manager and topic logic success/error and ordering paths.
- Route parameter mismatches are covered by regression tests.

## Execution Notes

- Added new Phase 04 E2E suite: `tests/e2e/subject-topic-content.spec.js`.
- New journeys implemented:
  - Subject page render and topic-surface reachability.
  - Topic-to-content route navigation via material/resource cards.
- Seed strategy hardening:
  - Supports direct env seeds (`E2E_SUBJECT_ID`, `E2E_TOPIC_ID`).
  - Added fallback auto-discovery path via Firebase Admin for subject/topic IDs when env seeds are absent.

- Added focused unit suites:
  - `tests/unit/hooks/useSubjectManager.test.js`
    - Missing-subject redirect handling.
    - Topic creation payload + subject `topicCount` increment update.
    - Topic reorder persistence via `writeBatch`.
  - `tests/unit/hooks/useTopicGridDnD.test.js`
    - Drag payload setup.
    - Drag-over drop enablement.
    - Reorder callback execution and same-target guard.

- Validation evidence:
  - `npm run test:unit -- tests/unit/hooks/useSubjectManager.test.js tests/unit/hooks/useTopicGridDnD.test.js` → ✅ `2 files`, `7 tests` passed.
  - `npm run test:e2e -- tests/e2e/subject-topic-content.spec.js --reporter=list` → ⚠️ `2 skipped` (no resolvable subject/topic seed for current E2E account in this run).
