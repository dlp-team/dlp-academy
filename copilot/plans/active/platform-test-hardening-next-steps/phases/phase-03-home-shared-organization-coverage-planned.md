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
- Added shortcut sharing + role matrix suite: `tests/unit/hooks/useHomeHandlers.shortcuts.test.js`.
- Covered sharing and permission cases:
  - Shortcut subject unshare is blocked when nested under shared-folder trees.
  - Shortcut subject unshare proceeds outside shared trees.
  - Shortcut folder hide path toggles manual hidden state.
  - Shortcut folder unshare blocked inside shared-folder trees, allowed outside.
  - Shortcut subject unhide and direct shortcut deletion action paths.
  - Non-owner folder delete path is denied.
  - Viewer cannot move subject via Home DnD handler; editor can.
- Additional validation evidence:
  - `npm run test:unit -- tests/unit/hooks/useHomeHandlers.shortcuts.test.js` → ✅ `1 file`, `9 tests` passed.
  - `npm run test:unit` → ✅ `9 files`, `34 tests` passed.
- Added Home page-level shortcut/role suite: `tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js`.
- Covered page-level sharing permission gates:
  - Shortcut move into shared target requests owner approval workflow.
  - Viewer is blocked from moving source content into shared target folder.
  - Editor can move source content into shared target folder.
- Covered callback execution paths for sharing confirmations:
  - Shared-mismatch merge callback updates target sharing and moves subject with force refresh.
  - Unshare confirmation preserve callback moves with `preserveSharing: true`.
  - Unshare confirmation standard callback moves without preservation options.
- Additional validation evidence:
  - `npm run test:unit -- tests/unit/hooks/useHomePageHandlers.shortcutsRoles.test.js` → ✅ `1 file`, `6 tests` passed.
  - `npm run test:unit` → ✅ `10 files`, `36 tests` passed.
- Added Home logic composition suite: `tests/unit/hooks/useHomeLogic.test.js`.
- Covered role-sensitive and sharing exposure paths:
  - Read-only role toggles `studentShortcutTagOnlyMode` passed into Home handlers.
  - Share/unshare and shortcut functions are correctly exposed from composed hook outputs.
- Additional validation evidence:
  - `npm run test:unit -- tests/unit/hooks/useHomeLogic.test.js` → ✅ `1 file`, `2 tests` passed.
  - `npm run test:unit` → ✅ `10 files`, `36 tests` passed.
