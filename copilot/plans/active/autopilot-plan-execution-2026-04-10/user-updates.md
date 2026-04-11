<!-- copilot/plans/active/autopilot-plan-execution-2026-04-10/user-updates.md -->
# User Updates

## How to Use
- Add new requests to Pending User Updates.
- Before each implementation block, sync pending updates into roadmap and phase files.
- After syncing, move handled items to Processed Updates with date and integrated-file references.

## Pending User Updates
- (none)


## Processed Updates
- 2026-04-10: Fixed Home manual-tab list collapse spacing regression by clipping collapsed folder children wrappers and keeping expanded overflow visible only when open. Integrated files: [src/components/modules/ListItems/FolderListItem.tsx](../../../../src/components/modules/ListItems/FolderListItem.tsx), [tests/unit/components/FolderListItem.collapseSpacing.test.jsx](../../../../tests/unit/components/FolderListItem.collapseSpacing.test.jsx).
- 2026-04-10: Hardened Home/global scrollbar surfaces to hide scrollbar box/track artifacts (transparent track-piece, hidden buttons, transparent resizer, auto overflow) while preserving visible thumb behavior. Integrated file: [src/index.css](../../../../src/index.css).
- 2026-04-10: Continued Phase 02 by adding mixed subject+folder undo parity coverage with sharing metadata restoration assertions. Integrated file: [tests/unit/hooks/useHomeBulkSelection.test.js](../../../../tests/unit/hooks/useHomeBulkSelection.test.js).
- 2026-04-10: Ingested root AUTOPILOT source into [sources/source-autopilot-user-spec-autopilot-plan-execution-2026-04-10.md](./sources/source-autopilot-user-spec-autopilot-plan-execution-2026-04-10.md) and synchronized roadmap/phases.
- 2026-04-10: Applied pre-plan governance requirements for autopilot intake trigger, branch-log merge authorization metadata, and human merge gate enforcement across checklist/instructions.
- 2026-04-10: Restored branch-lineage plan tracking in `BRANCH_LOG.md`, moved prior same-branch plan from active to finished (`autopilot-plan-execution-2026-04-09`), and updated checklist/protocol/template rules to prevent lineage-plan deletion.
- 2026-04-10: Implemented selection-mode batch drag visual and routing parity improvements (multi-item ghost stack, grid folder drop batch routing, and create-subject visibility with inert click behavior in selection mode).
- 2026-04-10: Implemented bulk undo reliability fixes (no selection-mode reactivation after undo + restoration of pre-move sharing metadata on undo).
- 2026-04-10: Implemented Phase 03 bin/notification refinements (bin grid re-press flicker fix, list pressed-state no-opacity guard, and Home feedback moved to fixed reusable `AppToast` notifications to prevent layout shifting).
- 2026-04-10: Implemented Phase 04 customization preview parity block by replacing `theme-preview` hardcoded mock rendering with real `Home` route composition, passing preview user context via postMessage payload, and removing nested preview-pane scrolling.
- 2026-04-10: Implemented Phase 05 block by fixing live dark/light scrollbar refresh with transparent gutter behavior and tightening `Solo Vigentes` to current-academic-year + active lifecycle/period eligibility.
