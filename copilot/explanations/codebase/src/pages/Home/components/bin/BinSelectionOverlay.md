<!-- copilot/explanations/codebase/src/pages/Home/components/bin/BinSelectionOverlay.md -->
# BinSelectionOverlay.tsx

## Overview
- **Source file:** `src/pages/Home/components/bin/BinSelectionOverlay.tsx`
- **Last documented:** 2026-04-05
- **Role:** Full-screen overlay that anchors selected bin card and side panel to viewport coordinates.

## Responsibilities
- Measures selected card bounds and re-renders focused content over backdrop.
- Positions action panel left/right/below based on viewport space.
- Routes typed item props into `BinSelectionPanel`.
- Applies staged focus UX with immediate panel availability and focused-card transition.

## Changelog
- **2026-04-09:** Removed backdrop color dimming (`bg-transparent`) while preserving outside-click close behavior so grid selection no longer darkens background on press.
- **2026-04-08:** Removed delayed panel reveal and kept panel rendering immediate after overlay mount; backdrop opacity was reduced to preserve card legibility while selected.
- **2026-04-07:** Bin focus overlay refined for visual parity:
	- softened backdrop opacity in light/dark modes,
	- synchronized focus and panel reveal timing at 200ms,
	- added GPU transform hint for smoother focused-card scale.
- **2026-04-05:** Removed backdrop blur, introduced selected-card focus transform transition, and delayed action panel reveal to align with focus transition timing.
- **2026-04-02:** Extended overlay contract from `subject` to typed `item`/`itemType` so folder selections share the same anchored UX path.
