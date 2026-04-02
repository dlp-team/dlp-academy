<!-- copilot/explanations/codebase/src/pages/Home/components/bin/BinSelectionOverlay.md -->
# BinSelectionOverlay.jsx

## Overview
- **Source file:** `src/pages/Home/components/bin/BinSelectionOverlay.jsx`
- **Last documented:** 2026-04-02
- **Role:** Full-screen overlay that anchors selected bin card and side panel to viewport coordinates.

## Responsibilities
- Measures selected card bounds and re-renders focused content over backdrop.
- Positions action panel left/right/below based on viewport space.
- Routes typed item props into `BinSelectionPanel`.

## Changelog
- **2026-04-02:** Extended overlay contract from `subject` to typed `item`/`itemType` so folder selections share the same anchored UX path.
