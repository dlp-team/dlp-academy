<!-- copilot/explanations/codebase/src/pages/Home/components/bin/BinGridItem.md -->
# BinGridItem.tsx

## Overview
- **Source file:** `src/pages/Home/components/bin/BinGridItem.tsx`
- **Last documented:** 2026-04-02
- **Role:** Visual card renderer for selected bin entries in grid mode.

## Responsibilities
- Renders trashed subject cards with existing `SubjectCard` visual system.
- Renders trashed folder cards with a dedicated folder visual treatment.
- Shows urgency and deletion countdown metadata for both item types.

## Changelog
- **2026-04-08:** Refined selected-card semantics for bin interaction parity:
	- shared ring highlight now appears only when bin selection mode is active,
	- non-selection focused card uses pressed-scale and elevated shadow treatment,
	- unselected dimming path remains unchanged.
- **2026-04-04:** Updated grid-card selection visuals to reuse shared Home selection ring classes and replaced opacity-based dimming with brightness/saturation dimming for unselected items.
- **2026-04-03:** Added shortcut-aware rendering:
	- supports `shortcut-subject` and `shortcut-folder` item types,
	- adds explicit shortcut badges/labels while preserving existing folder/subject visual styles.
- **2026-04-02:** Generalized the component from subject-only rendering to typed rendering (`subject` / `folder`) so BinView can surface folder containers in the bin grid.
