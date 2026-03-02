# Phase 04 — Subject, Topic, and Content Navigation Coverage (PLANNED)

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
