# Phase 03 — Home and Shared Organization Coverage (IN_PROGRESS)

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

## Execution Notes

- Added new Home DnD unit suite: `tests/unit/hooks/useHomeContentDnd.test.js`.
- Covered key drag/drop transitions:
  - Promote-zone subject promotion path.
  - Root-zone drop path using tree payload and `handleDropOnFolder`.
  - Subject reorder within same parent list.
  - Folder move path using source-aware handler.
- Validation evidence:
  - `npm run test:unit -- tests/unit/hooks/useHomeContentDnd.test.js` → ✅ `1 file`, `4 tests` passed.
  - `npm run test:unit` → ✅ `7 files`, `19 tests` passed.
