# Phase 03 — Home and Shared Organization Coverage (PLANNED)

## Objective

Protect the main organization surface in Home, including folder/subject creation, navigation, and shared view behavior.

## Planned Changes / Actions

- Add Playwright journeys for:
  - Folder creation and subject creation from Home controls.
  - Folder tree navigation and breadcrumb consistency.
  - Shared view switching and shared-scope behavior.
- Add Vitest coverage for:
  - `src/pages/Home/hooks/useHomeLogic.js`
  - `src/pages/Home/hooks/useHomeHandlers.js`
  - `src/pages/Home/hooks/useHomePageHandlers.js`
  - `src/pages/Home/hooks/useHomeContentDnd.js`

## Risks

- Drag/drop and ordering state can be flaky without stable selectors and deterministic data.
- Shared/owner visibility rules can diverge by role.

## Completion Criteria

- Home E2E journeys pass across owner/editor/viewer expectations.
- Hook tests validate state transitions for create/move/navigate operations.
- No known double-click or route-sync regressions remain in breadcrumb/folder flow.
