// copilot/explanations/codebase/src/pages/Home/utils/homeSelectionDropUtils.md

## Changelog
### 2026-04-09: New grouped-drop selection key helpers
- Added normalized helpers to resolve dragged selection keys from:
  - native drop events (`dataTransfer`),
  - breadcrumb/drop argument payloads.
- Added guard helper to decide when grouped selection routing should be applied (`selectMode` active + dragged key present in selected key set).

## Overview
Utility module for Home grouped drag/drop routing decisions in selection mode.

## Exports
- `getDraggedSelectionKeyFromDropArgs(args)`
- `getDraggedSelectionKeyFromDropEvent(event)`
- `shouldHandleSelectionDrop({ selectMode, selectedItemKeys, draggedSelectionKey })`
