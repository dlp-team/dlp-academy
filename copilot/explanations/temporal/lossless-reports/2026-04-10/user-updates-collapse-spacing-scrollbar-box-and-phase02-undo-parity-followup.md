<!-- copilot/explanations/temporal/lossless-reports/2026-04-10/user-updates-collapse-spacing-scrollbar-box-and-phase02-undo-parity-followup.md -->
# Lossless Report - User Updates Remediation + Phase 02 Undo Parity Follow-up (2026-04-10)

## Requested Scope
- Resolve pending Home manual-tab list regression where collapsed folders leave blank space in list mode.
- Resolve pending scrollbar artifact issue so scrollbar track/box/button visuals are suppressed and thumb remains the visible affordance.
- Continue active plan execution by extending Phase 02 batch undo parity coverage.

## Preserved Behaviors
- Existing recursive folder rendering and selection-ring protection remain intact.
- Existing drag-and-drop wiring, permissions, and context actions in list rows remain unchanged.
- Existing Home/global scrollbar activation classes and theme token model remain unchanged.
- Existing `useHomeBulkSelection` undo pipeline contract remains unchanged; coverage only expands to mixed-entity parity.

## Touched Files
- [src/components/modules/ListItems/FolderListItem.tsx](../../../../../src/components/modules/ListItems/FolderListItem.tsx)
- [src/index.css](../../../../../src/index.css)
- [tests/unit/components/FolderListItem.collapseSpacing.test.jsx](../../../../../tests/unit/components/FolderListItem.collapseSpacing.test.jsx)
- [tests/unit/hooks/useHomeBulkSelection.test.js](../../../../../tests/unit/hooks/useHomeBulkSelection.test.js)

## Per-File Verification
- [src/components/modules/ListItems/FolderListItem.tsx](../../../../../src/components/modules/ListItems/FolderListItem.tsx)
  - Added deterministic test hooks for children shell/content wrappers.
  - Converted children content wrapper to stateful overflow/padding classes so collapsed rows clip and expanded rows preserve visual ring safety.
- [src/index.css](../../../../../src/index.css)
  - Enforced transparent scrollbar track-piece behavior and hid scrollbar buttons.
  - Added transparent scrollbar corner/resizer handling to remove background artifacts.
  - Switched active scrollbar mode overflow strategy to `overflow-y: auto` with `scrollbar-gutter: auto`.
- [tests/unit/components/FolderListItem.collapseSpacing.test.jsx](../../../../../tests/unit/components/FolderListItem.collapseSpacing.test.jsx)
  - Added regression assertions for collapsed/expanded wrapper class transitions.
- [tests/unit/hooks/useHomeBulkSelection.test.js](../../../../../tests/unit/hooks/useHomeBulkSelection.test.js)
  - Added mixed subject+folder batch undo parity test covering location and sharing metadata restoration.

## Validation Summary
- `get_errors` on touched files -> PASS.
- `npm run test:unit -- tests/unit/hooks/useHomeBulkSelection.test.js` -> PASS (6 tests).
- `npm run test:unit -- tests/unit/components/FolderListItem.collapseSpacing.test.jsx tests/unit/components/ListViewItem.selectionDimming.test.jsx tests/unit/components/CustomScrollbar.test.jsx tests/unit/hooks/useHomeState.academicYearFilter.test.js tests/unit/hooks/useHomeBulkSelection.test.js` -> PASS (23 tests).
